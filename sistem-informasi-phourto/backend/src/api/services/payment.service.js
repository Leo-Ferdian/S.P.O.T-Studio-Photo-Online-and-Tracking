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

const dokuClient = axios.create();

class PaymentService {

    _createSignature(stringToSign) {
        return crypto.createHmac('sha256', DOKU_SECRET_KEY)
            .update(stringToSign)
            .digest('base64');
    }

    // --- 1. GENERATE QR CODE ---
    async generateQrCode(bookingId, userId) {
        console.log(`[PAYMENT] 1. Generate QR untuk Booking: ${bookingId}`);

        // ✅ FIXED: Menggunakan schema 'phourto.'
        const bookingQuery = `SELECT * FROM phourto.bookings WHERE booking_id = $1::uuid LIMIT 1`;
        const userQuery = `SELECT * FROM phourto.users WHERE user_id = $1::uuid LIMIT 1`;

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

            // ✅ FIXED: Update ke 'phourto.bookings'
            await db.query(`
                UPDATE phourto.bookings 
                SET payment_gateway_ref = $1, payment_qr_url = $2, amount_paid = $3, updated_at = NOW()
                WHERE booking_id = $4
            `, [paymentId, paymentUrl, amountValue, booking.booking_id]);

            console.log(`[PAYMENT] QR Code Created: ${invoiceNumber}`);
            return { order_id: invoiceNumber, payment_id: paymentId, payment_url: paymentUrl, total_amount: amountValue };

        } catch (error) {
            console.error("❌ DOKU Error:", error.response ? error.response.data : error.message);
            throw new ApiError(502, "Gagal membuat pembayaran ke DOKU.");
        }
    }

    // --- 2. CEK STATUS (Manual dari Frontend) ---
    async checkTransactionStatus(bookingId) {
        console.log(`[PAYMENT] Cek Status Manual ID: ${bookingId}`);

        const requestTarget = `/orders/v1/status/${bookingId}`;
        const requestId = `CHK-${Date.now()}`;
        const timestamp = new Date().toISOString().substring(0, 19) + "Z";
        const digest = crypto.createHash('sha256').update("").digest('base64');
        const stringToSign = `Client-Id:${DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
        const signature = this._createSignature(stringToSign);

        try {
            // ✅ FIXED: Variabel DOKU_API_URL
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
            console.log(`📡 Status DOKU: ${transactionStatus}`);

            if (transactionStatus === 'SUCCESS') {
                // ✅ FIXED: Update 'PAID-FULL' ke 'phourto.bookings'
                await db.query(
                    `UPDATE phourto.bookings SET payment_status = 'PAID-FULL', updated_at = NOW() WHERE booking_id = $1`,
                    [bookingId]
                );
                console.log(`🎉 DB Updated: PAID-FULL`);
                return { status: 'PAID-FULL', message: 'Pembayaran Berhasil' };
            }
            else if (['FAILED', 'EXPIRED'].includes(transactionStatus)) {
                const statusDb = transactionStatus === 'EXPIRED' ? 'EXPIRED' : 'FAILED';
                await db.query(
                    `UPDATE phourto.bookings SET payment_status = $1, updated_at = NOW() WHERE booking_id = $2`,
                    [statusDb, bookingId]
                );
                console.log(`❌ DB Updated: ${statusDb}`);
                return { status: statusDb, message: 'Pembayaran Gagal' };
            }

            return { status: 'PENDING', message: 'Menunggu Pembayaran' };

        } catch (error) {
            console.error("🔥 Error Cek Status:", error.message);
            return { status: 'PENDING', message: 'Belum terupdate' };
        }
    }

    // --- 3. WEBHOOK (Otomatis dari DOKU) ---
    async handleDokuNotification(notificationPayload, headers) {
        // Logging Awal untuk memastikan request masuk
        console.log("🔔 [WEBHOOK] Request Masuk...");

        const clientId = headers['client-id'] || headers['Client-Id'];
        if (clientId !== DOKU_CLIENT_ID) console.warn(`⚠️ Webhook Client ID mismatch`);

        const invoiceNumber = notificationPayload.order?.invoice_number;
        const status = notificationPayload.transaction?.status;
        const paymentChannel = notificationPayload.channel?.id;

        console.log(`📦 Webhook Payload: Invoice=${invoiceNumber}, Status=${status}`);

        if (!invoiceNumber) throw new ApiError(400, "Invoice missing.");

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            if (status === 'SUCCESS') {
                // ✅ FIXED: Update 'PAID-FULL' ke 'phourto.bookings'
                // Pastikan kolom 'payment_method' ada di tabel Anda, jika tidak hapus baris payment_method
                const res = await client.query(`
                    UPDATE phourto.bookings 
                    SET payment_status = 'PAID-FULL', 
                        payment_method = $1, 
                        updated_at = NOW() 
                    WHERE booking_id = $2
                    RETURNING booking_id
                `, [paymentChannel, invoiceNumber]);

                if (res.rowCount > 0) {
                    console.log(`✅ SUKSES! Webhook berhasil update DB ke PAID-FULL`);
                } else {
                    console.error(`⚠️ GAGAL! Query jalan tapi Booking ID tidak ditemukan di 'phourto.bookings'`);
                }

            } else if (['FAILED', 'EXPIRED'].includes(status)) {
                const statusDb = status === 'EXPIRED' ? 'EXPIRED' : 'FAILED';
                await client.query(`
                    UPDATE phourto.bookings SET payment_status = $1, updated_at = NOW() WHERE booking_id = $2
                `, [statusDb, invoiceNumber]);

                console.log(`❌ Webhook update ke: ${statusDb}`);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`🔥 Webhook Error: ${error.message}`);
            // Jangan throw error agar Doku tidak retry terus menerus
        } finally {
            client.release();
        }
    }
}

module.exports = new PaymentService();