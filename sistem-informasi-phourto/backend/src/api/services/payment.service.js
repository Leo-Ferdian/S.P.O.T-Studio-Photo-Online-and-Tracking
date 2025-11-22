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

            // Update DB (cast booking_id ke UUID untuk memastikan match)
            const updateQuery = `
            UPDATE bookings
            SET 
                payment_gateway_ref = $1,
                payment_qr_url = $2,
                amount_paid = $3,
                updated_at = NOW()
            WHERE booking_id = $4::uuid
            RETURNING *;
        `;

            const updateResult = await db.query(updateQuery, [
                paymentId,
                paymentUrl,
                amountValue,
                booking.booking_id
            ]);

            if (updateResult.rowCount === 0) {
                console.warn('[PAYMENT] Warning: no booking row updated after createCheckoutPayment for booking:', booking.booking_id);
            } else {
                console.log('[PAYMENT] Booking updated after createCheckoutPayment, rows:', updateResult.rowCount);
            }

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
    // --- 2. CEK STATUS TRANSAKSI (Jaring Pengaman) ---
    async checkTransactionStatus(bookingId) {
        console.log(`[PAYMENT] Checking status for booking: ${bookingId}`);

        // Endpoint DOKU untuk Cek Status
        const requestTarget = `/orders/v1/status/${bookingId}`;
        const requestId = `CHK-${Date.now()}`;

        // Timestamp ISO tanpa milidetik (.000Z -> Z)
        const now = new Date();
        const timestamp = now.toISOString().substring(0, 19) + "Z";

        // Digest untuk GET request biasanya string kosong
        const digest = crypto.createHash('sha256').update("").digest('base64');

        const stringToSign =
            `Client-Id:${DOKU_CLIENT_ID}\n` +
            `Request-Id:${requestId}\n` +
            `Request-Timestamp:${timestamp}\n` +
            `Request-Target:${requestTarget}\n` +
            `Digest:${digest}`;

        const signature = this._createSignature(stringToSign);
        const finalSignatureHeader = "HMACSHA256=" + signature;

        try {
            // Gunakan instance dokuClient yang bersih
            const response = await dokuClient.get(DOKU_API_URL + requestTarget, {
                headers: {
                    'Client-Id': DOKU_CLIENT_ID,
                    'Request-Id': requestId,
                    'Request-Timestamp': timestamp,
                    'Signature': finalSignatureHeader,
                    'Request-Target': requestTarget // Kadang dibutuhkan untuk GET
                }
            });

            const transactionStatus = response.data.transaction.status;
            console.log(`[PAYMENT] Real-time status from DOKU: ${transactionStatus}`);

            // [PERBAIKAN DATABASE]
            // Gunakan kolom 'payment_status' dan nilai 'PAID-FULL'
            if (transactionStatus === 'SUCCESS') {
                const res = await db.query(
                    `UPDATE bookings 
                    SET payment_status = 'PAID-FULL', updated_at = NOW() 
                    WHERE booking_id = $1::uuid AND payment_status != 'PAID-FULL'`,
                    [bookingId]
                );
                console.log('[PAYMENT] checkTransactionStatus - rows updated:', res.rowCount);
                return { status: 'PAID-FULL', message: 'Pembayaran Berhasil (Updated)' };
            }
            else if (transactionStatus === 'FAILED' || transactionStatus === 'EXPIRED') {
                const res = await db.query(
                    `UPDATE bookings 
                    SET payment_status = 'FAILED', updated_at = NOW() 
                    WHERE booking_id = $1::uuid`,
                    [bookingId]
                );
                console.log('[PAYMENT] checkTransactionStatus - rows updated (failed/expired):', res.rowCount);
                return { status: 'FAILED', message: 'Pembayaran Gagal/Expired' };
            }

            return { status: 'PENDING', message: 'Menunggu Pembayaran' };

        } catch (error) {
            // Jika error 404 dari DOKU, berarti transaksi belum dibuat/ditemukan
            if (error.response && error.response.status === 404) {
                console.warn(`[PAYMENT] Transaksi ${bookingId} belum ada di DOKU.`);
                return { status: 'NOT_FOUND', message: 'Belum ada transaksi' };
            }

            console.error("❌ Gagal Cek Status DOKU:", error.message);
            // Jangan throw error agar frontend tidak crash, cukup return status lama
            return { status: 'UNKNOWN', message: 'Gagal cek status' };
        }
    }

    // --- 3. HANDLE WEBHOOK ---
    async handleDokuNotification(notificationPayload, headers) {
        const clientId = headers['client-id'];

        if (clientId !== DOKU_CLIENT_ID) {
            logger.warn(`Webhook Client ID mismatch: ${clientId}`);
        }

        // PAKSA menggunakan order.invoice_number (harus sama dengan booking.booking_id)
        const invoiceNumber = notificationPayload.order?.invoice_number;
        const status = notificationPayload.transaction?.status;

        logger.info('[WEBHOOK] Received DOKU notification for invoice:', invoiceNumber, 'status:', status);

        if (!invoiceNumber) {
            logger.error('[WEBHOOK] invoice_number missing in payload:', JSON.stringify(notificationPayload));
            throw new ApiError(400, "Invoice tidak ditemukan di payload.");
        }

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // ✅ FIXED: Pakai 'phourto.bookings'
            if (status === 'SUCCESS') {
                // [PERBAIKAN STATUS]: Menggunakan 'PAID-FULL' (dengan strip)
                const updateSuccess = `
                    UPDATE bookings 
                    SET payment_status = 'PAID-FULL', updated_at = NOW() 
                    WHERE booking_id = $1::uuid
                `;
                const res = await client.query(updateSuccess, [invoiceNumber]);
                logger.info(`[WEBHOOK] Booking ${invoiceNumber} update to PAID-FULL. rowsAffected=${res.rowCount}`);
            } else if (status === 'FAILED' || status === 'EXPIRED') {
                const updateFail = `
                    UPDATE bookings 
                    SET payment_status = 'FAILED', updated_at = NOW() 
                    WHERE booking_id = $1::uuid
                `;
                const res = await client.query(updateFail, [invoiceNumber]);
                logger.info(`[WEBHOOK] Booking ${invoiceNumber} update to FAILED. rowsAffected=${res.rowCount}`);
            } else {
                logger.info(`[WEBHOOK] Unhandled status '${status}' for invoice ${invoiceNumber}`);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error(`Webhook Error: ${error.message}`);
        } finally {
            client.release();
        }
    }
}

module.exports = new PaymentService();
