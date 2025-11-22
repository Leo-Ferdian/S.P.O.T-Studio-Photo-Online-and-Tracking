const crypto = require('crypto');
const axios = require('axios');
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');
require('dotenv').config();

// 👇 IMPOR BOOKING SERVICE (INI KUNCINYA)
const BookingService = require('./booking.service');

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
        // Kita gunakan BookingService untuk ambil data (lebih aman)
        const booking = await BookingService.getBookingById(bookingId, userId);

        // Ambil data user manual (karena getBookingById mungkin struktur usernya beda)
        const userQuery = `SELECT * FROM users WHERE user_id = $1::uuid LIMIT 1`;
        const userResult = await db.query(userQuery, [userId]);
        const user = userResult.rows[0];

        if (!booking) throw new ApiError(404, 'Booking tidak ditemukan.');

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

            // Update data payment gateway reference
            // Kita pakai raw query simple ini gpp, atau buat method di BookingService
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

    // --- 2. CEK STATUS (INTEGRASI BOOKING SERVICE) ---
    async checkTransactionStatus(bookingId) {
        console.log(`[PAYMENT] Cek Status via DOKU: ${bookingId}`);

        const requestTarget = `/orders/v1/status/${bookingId}`;
        const requestId = `CHK-${Date.now()}`;
        const timestamp = new Date().toISOString().substring(0, 19) + "Z";
        const digest = crypto.createHash('sha256').update("").digest('base64');
        const stringToSign = `Client-Id:${DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
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
            const amountPaid = response.data.order.amount; // Ambil nominal dari DOKU
            console.log(`📡 DOKU Respon: ${transactionStatus}`);

            const client = await db.getClient();
            try {
                await client.query('BEGIN');

                if (transactionStatus === 'SUCCESS') {
                    // 🔥 INI SOLUSINYA: PANGGIL BOOKING SERVICE
                    // Biarkan BookingService yang menghitung logika pelunasan, DP, dan update DB
                    console.log("✅ Payment Sukses, memanggil BookingService...");

                    await BookingService.handleSuccessfulPayment(
                        bookingId,
                        amountPaid,
                        'DOKU_GATEWAY',
                        client // Oper client transaksi agar atomik
                    );

                    await client.query('COMMIT');
                    return { status: 'PAID-FULL', message: 'Pembayaran Berhasil' };
                }
                else if (transactionStatus === 'FAILED') {
                    // Update manual untuk failed
                    await client.query(
                        `UPDATE bookings SET payment_status = 'FAILED', status = 'CANCELLED', updated_at = NOW() WHERE booking_id = $1`,
                        [bookingId]
                    );
                    await client.query('COMMIT');
                    return { status: 'FAILED', message: 'Pembayaran Gagal' };
                }

                await client.query('COMMIT');
                return { status: 'PENDING', message: 'Menunggu Pembayaran' };

            } catch (dbError) {
                await client.query('ROLLBACK');
                console.error("🔥 DB Error saat update status:", dbError.message);
                throw dbError;
            } finally {
                client.release();
            }

        } catch (error) {
            console.error("🔥 API Error:", error.message);
            return { status: 'PENDING', message: 'Belum terupdate' };
        }
    }

    // --- 3. WEBHOOK (INTEGRASI BOOKING SERVICE) ---
    async handleDokuNotification(notificationPayload, headers) {
        const clientId = headers['client-id'] || headers['Client-Id'];
        if (clientId !== DOKU_CLIENT_ID) logger.warn(`Webhook Client ID mismatch`);

        const invoiceNumber = notificationPayload.order?.invoice_number;
        const status = notificationPayload.transaction?.status;
        const amount = notificationPayload.order?.amount || 0;
        const channel = notificationPayload.channel?.id || 'DOKU_UNKNOWN';

        if (!invoiceNumber) throw new ApiError(400, "Invoice missing.");

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            if (status === 'SUCCESS') {
                // 🔥 PANGGIL BOOKING SERVICE JUGA DI SINI
                logger.info(`✅ Webhook Sukses: ${invoiceNumber}. Memanggil BookingService...`);

                await BookingService.handleSuccessfulPayment(
                    invoiceNumber,
                    amount,
                    channel,
                    client
                );

                logger.info(`✅ Booking ${invoiceNumber} sukses diupdate via BookingService.`);

            } else if (status === 'FAILED') {
                await client.query(`
                    UPDATE bookings SET payment_status = 'FAILED', status = 'CANCELLED', updated_at = NOW() WHERE booking_id = $1
                `, [invoiceNumber]);
                logger.info(`❌ Webhook: ${invoiceNumber} -> FAILED`);
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