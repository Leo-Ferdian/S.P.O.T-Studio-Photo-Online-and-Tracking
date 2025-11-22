const crypto = require('crypto');
const axios = require('axios');
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');
require('dotenv').config();

// Pastikan .env memiliki DOKU_API_URL (Sandbox: https://api-sandbox.doku.com, Prod: https://api.doku.com)
const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;
const DOKU_API_URL = process.env.DOKU_API_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const dokuClient = axios.create();

class PaymentService {

    _createSignature(stringToSign) {
        return crypto.createHmac('sha256', DOKU_SECRET_KEY)
            .update(stringToSign)
            .digest('base64');
    }

    // --- 1. GENERATE QR CODE ---
    async generateQrCode(bookingId, userId) {
        // ... Logika generate tidak berubah, sudah aman ...
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

        if (!booking) throw new ApiError(404, 'Booking tidak ditemukan.');
        if (booking.user_id.toString() !== userId.toString()) throw new ApiError(403, 'Akses ditolak.');

        return this.createCheckoutPayment(booking, user);
    }

    async createCheckoutPayment(booking, user) {
        const requestId = `REQ-${booking.booking_id.substring(0, 8)}-${Date.now()}`;
        const now = new Date();
        const timestamp = now.toISOString().substring(0, 19) + "Z";
        const amountValue = Math.round(booking.total_price || booking.amount_due || 0);

        const body = {
            order: {
                amount: amountValue,
                invoice_number: booking.booking_id,
                currency: "IDR",
                callback_url: `${FRONTEND_URL}/booking/success?id=${booking.booking_id}`,
                auto_redirect: true
            },
            payment: { payment_due_date: 60 },
            customer: {
                name: user.full_name || "Customer Phourto",
                email: user.email,
                phone: user.phone_number || "081234567890"
            }
        };

        const bodyString = JSON.stringify(body);
        const digest = crypto.createHash('sha256').update(bodyString).digest('base64');
        const requestTarget = "/checkout/v1/payment";

        const stringToSign = `Client-Id:${DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
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

            const { id: paymentId, url: paymentUrl } = response.data.response.payment;
            const invoiceNumber = response.data.response.order.invoice_number;

            await db.query(`
                UPDATE bookings 
                SET payment_gateway_ref = $1, payment_qr_url = $2, amount_paid = $3, updated_at = NOW()
                WHERE booking_id = $4
            `, [paymentId, paymentUrl, amountValue, booking.booking_id]);

            return { order_id: invoiceNumber, payment_id: paymentId, payment_url: paymentUrl, total_amount: amountValue };
        } catch (error) {
            console.error("❌ DOKU Error:", error.message);
            throw new ApiError(502, "Gagal membuat pembayaran ke DOKU.");
        }
    }

    // --- 2. CEK STATUS (PERBAIKAN UTAMA DI SINI) ---
    async checkTransactionStatus(bookingId) {
        console.log(`[PAYMENT] Checking status for booking: ${bookingId}`);

        const requestTarget = `/orders/v1/status/${bookingId}`;
        const requestId = `CHK-${Date.now()}`;
        const timestamp = new Date().toISOString().substring(0, 19) + "Z";
        const digest = crypto.createHash('sha256').update("").digest('base64');

        const stringToSign = `Client-Id:${DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
        const signature = this._createSignature(stringToSign);

        try {
            // ✅ FIXED: Menggunakan DOKU_API_URL (bukan DOKU_API_BASE_URL yang undefined)
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
            console.log(`[PAYMENT] Status DOKU Realtime: ${transactionStatus}`);

            if (transactionStatus === 'SUCCESS') {
                // ✅ UPDATE DATABASE: PAID-FULL
                await db.query(
                    `UPDATE bookings SET payment_status = 'PAID-FULL', updated_at = NOW() WHERE booking_id = $1 AND payment_status != 'PAID-FULL'`,
                    [bookingId]
                );
                return { status: 'PAID-FULL', message: 'Pembayaran Berhasil' };
            }
            else if (transactionStatus === 'FAILED') {
                // ✅ UPDATE DATABASE: FAILED
                await db.query(
                    `UPDATE bookings SET payment_status = 'FAILED', status = 'CANCELLED', updated_at = NOW() WHERE booking_id = $1`,
                    [bookingId]
                );
                return { status: 'FAILED', message: 'Pembayaran Gagal' };
            }

            return { status: 'PENDING', message: 'Menunggu Pembayaran' };

        } catch (error) {
            console.error("❌ Gagal Cek Status:", error.message);
            // Jangan throw error agar frontend tidak crash
            return { status: 'PENDING', message: 'Belum terupdate (Error Check)' };
        }
    }

    // --- 3. WEBHOOK ---
    async handleDokuNotification(notificationPayload, headers) {
        const clientId = headers['client-id'] || headers['Client-Id'];
        if (clientId !== DOKU_CLIENT_ID) logger.warn(`Webhook Client ID mismatch`);

        const invoiceNumber = notificationPayload.order?.invoice_number;
        const status = notificationPayload.transaction?.status;
        const paymentChannel = notificationPayload.channel?.id;

        if (!invoiceNumber) throw new ApiError(400, "Invoice missing.");

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            if (status === 'SUCCESS') {
                // ✅ UPDATE: PAID-FULL
                await client.query(`
                    UPDATE bookings 
                    SET payment_status = 'PAID-FULL', payment_method = $1, updated_at = NOW() 
                    WHERE booking_id = $2
                `, [paymentChannel, invoiceNumber]);
                logger.info(`✅ Webhook: ${invoiceNumber} -> PAID-FULL`);

            } else if (status === 'FAILED') {
                // ✅ UPDATE: FAILED
                await client.query(`
                    UPDATE bookings SET payment_status = 'FAILED', status = 'CANCELLED', updated_at = NOW() WHERE booking_id = $1
                `, [invoiceNumber]);
                logger.info(`❌ Webhook: ${invoiceNumber} -> FAILED`);
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new PaymentService();