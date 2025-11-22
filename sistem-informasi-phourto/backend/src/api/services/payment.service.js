const crypto = require('crypto');
const axios = require('axios');
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');
require('dotenv').config();

const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;
const DOKU_API_URL = process.env.DOKU_API_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Instance Axios
const dokuClient = axios.create();

class PaymentService {

    _createSignature(stringToSign) {
        return crypto.createHmac('sha256', DOKU_SECRET_KEY)
            .update(stringToSign)
            .digest('base64');
    }

    // --- 1. GENERATE QR CODE ---
    async generateQrCode(bookingId, userId) {
        console.log("\n============== [PAYMENT SERVICE] ==============");
        console.log("1. Processing Booking ID:", bookingId);

        const bookingQuery = `SELECT * FROM bookings WHERE booking_id = $1::uuid LIMIT 1`;
        const userQuery = `SELECT * FROM users WHERE user_id = $1::uuid LIMIT 1`;

        let booking, user;
        try {
            const bookingResult = await db.query(bookingQuery, [bookingId]);
            booking = bookingResult.rows[0];

            const userResult = await db.query(userQuery, [userId]);
            user = userResult.rows[0];
        } catch (dbError) {
            throw new ApiError(500, "Database Error: " + dbError.message);
        }

        if (!booking) throw new ApiError(404, 'Booking tidak ditemukan di database.');
        if (!user) throw new ApiError(404, 'User tidak ditemukan.');

        if (booking.user_id.toString() !== userId.toString()) {
            throw new ApiError(403, 'Akses ditolak: Anda bukan pemilik booking ini.');
        }

        return this.createCheckoutPayment(booking, user);
    }

    async createCheckoutPayment(booking, user) {
        const requestId = `REQ-${booking.booking_id.substring(0, 8)}-${Date.now()}`;
        const now = new Date();
        const timestamp = now.toISOString().substring(0, 19) + "Z";
        const amountValue = Math.round(booking.total_price || booking.amount_due || 0);

        // ✅ PERBAIKAN 1: Hapus Localhost, ganti domain production
        const body = {
            order: {
                amount: amountValue,
                invoice_number: booking.booking_id,
                currency: "IDR",
                callback_url: `${FRONTEND_URL}/booking/success?id=${booking.booking_id}`,
                auto_redirect: true
            },
            payment: {
                payment_due_date: 60
            },
            customer: {
                name: user.full_name || "Customer Phourto",
                email: user.email,
                phone: user.phone_number || "081234567890"
            }
        };

        const bodyString = JSON.stringify(body);
        const digest = crypto.createHash('sha256').update(bodyString).digest('base64');
        const requestTarget = "/checkout/v1/payment";

        const stringToSign =
            `Client-Id:${DOKU_CLIENT_ID}\n` +
            `Request-Id:${requestId}\n` +
            `Request-Timestamp:${timestamp}\n` +
            `Request-Target:${requestTarget}\n` +
            `Digest:${digest}`;

        const signature = this._createSignature(stringToSign);

        try {
            const response = await dokuClient.post(DOKU_API_URL + requestTarget, body, {
                headers: {
                    'Client-Id': DOKU_CLIENT_ID,
                    'Request-Id': requestId,
                    'Request-Timestamp': timestamp,
                    'Signature': "HMACSHA256=" + signature,
                    'Content-Type': 'application/json'
                }
            });

            const paymentId = response.data.response.payment.id;
            const paymentUrl = response.data.response.payment.url;
            const invoiceNumber = response.data.response.order.invoice_number;

            // Update DB
            const updateQuery = `
            UPDATE bookings
            SET 
                payment_gateway_ref = $1,
                payment_qr_url = $2,
                amount_paid = $3,
                updated_at = NOW()
            WHERE booking_id = $4
            RETURNING *;
        `;

            await db.query(updateQuery, [
                paymentId,
                paymentUrl,
                amountValue,
                booking.booking_id
            ]);

            return {
                order_id: invoiceNumber,
                payment_id: paymentId,
                payment_url: paymentUrl,
                total_amount: amountValue,
            };

        } catch (error) {
            console.error("❌ DOKU Error:", error.response ? error.response.data : error.message);
            throw new ApiError(502, "Gagal membuat pembayaran ke DOKU.");
        }
    }

    // --- ✅ PERBAIKAN 2: MENAMBAHKAN FUNGSI CEK STATUS (WAJIB ADA) ---
    async checkTransactionStatus(bookingId) {
        console.log(`[PAYMENT] Checking status for booking: ${bookingId}`);

        const requestTarget = `/orders/v1/status/${bookingId}`;
        const requestId = `CHK-${Date.now()}`;
        const now = new Date();
        const timestamp = now.toISOString().substring(0, 19) + "Z";

        // Digest untuk GET request biasanya string kosong hash
        const digest = crypto.createHash('sha256').update("").digest('base64');

        const stringToSign =
            `Client-Id:${DOKU_CLIENT_ID}\n` +
            `Request-Id:${requestId}\n` +
            `Request-Timestamp:${timestamp}\n` +
            `Request-Target:${requestTarget}\n` +
            `Digest:${digest}`;

        const signature = this._createSignature(stringToSign);

        try {
            const response = await dokuClient.get(DOKU_API_URL + requestTarget, {
                headers: {
                    'Client-Id': DOKU_CLIENT_ID,
                    'Request-Id': requestId,
                    'Request-Timestamp': timestamp,
                    'Signature': "HMACSHA256=" + signature,
                    'Request-Target': requestTarget
                }
            });

            const transactionStatus = response.data.transaction.status;
            console.log(`[PAYMENT] Real-time status from DOKU: ${transactionStatus}`);

            if (transactionStatus === 'SUCCESS') {
                // Gunakan PAID-FULL agar aman sesuai ENUM
                await db.query(
                    `UPDATE bookings SET status = 'PAID-FULL', updated_at = NOW() WHERE booking_id = $1 AND status != 'PAID-FULL'`,
                    [bookingId]
                );
                return { status: 'PAID-FULL', message: 'Pembayaran Berhasil' };
            }
            else if (transactionStatus === 'FAILED' || transactionStatus === 'EXPIRED') {
                await db.query(
                    `UPDATE bookings SET status = 'CANCELLED', updated_at = NOW() WHERE booking_id = $1`,
                    [bookingId]
                );
                return { status: 'CANCELLED', message: 'Pembayaran Gagal/Expired' };
            }

            return { status: 'PENDING', message: 'Menunggu Pembayaran' };

        } catch (error) {
            console.error("❌ Gagal Cek Status DOKU:", error.message);
            return { status: 'PENDING', message: 'Belum terupdate' };
        }
    }

    // --- 3. HANDLE WEBHOOK ---
    async handleDokuNotification(notificationPayload, headers) {
        const clientId = headers['client-id'];

        if (clientId !== DOKU_CLIENT_ID) {
            logger.warn(`Webhook Client ID mismatch: ${clientId}`);
        }

        const invoiceNumber = notificationPayload.order?.invoice_number || notificationPayload.transaction?.partnerReferenceNo;
        const transactionStatus = notificationPayload.transaction?.status;

        if (!invoiceNumber) throw new ApiError(400, "Invoice tidak ditemukan di payload.");
        console.log(`🔔 Webhook Diterima: Invoice ${invoiceNumber}, Status ${transactionStatus}`);

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            if (transactionStatus === 'SUCCESS') {
                // [PERBAIKAN] 
                // 1. Menggunakan kolom 'payment_status' (bukan 'status')
                // 2. Menggunakan nilai 'PAID_FULL' (sesuai logika frontend Anda)
                const updateSuccess = `
                    UPDATE bookings 
                    SET 
                        payment_status = 'PAID_FULL', 
                        updated_at = NOW() 
                    WHERE booking_id = $1
                `;
                await client.query(updateSuccess, [invoiceNumber]);
                logger.info(`✅ [WEBHOOK] Booking ${invoiceNumber} berhasil diupdate ke PAID_FULL.`);

            } else if (transactionStatus === 'FAILED' || transactionStatus === 'EXPIRED') {
                const updateFail = `
                    UPDATE bookings 
                    SET 
                        payment_status = 'FAILED', 
                        updated_at = NOW() 
                    WHERE booking_id = $1
                `;
                await client.query(updateFail, [invoiceNumber]);
                logger.info(`❌ [WEBHOOK] Booking ${invoiceNumber} diupdate ke FAILED.`);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error(`Webhook Error: ${error.message}`);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new PaymentService();