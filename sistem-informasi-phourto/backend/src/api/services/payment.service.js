const crypto = require('crypto');
const axios = require('axios');
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');
const url = require('url');
require('dotenv').config();

const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;
const DOKU_ORDER_URL = process.env.DOKU_API_URL;

const DOKU_WEBHOOK_TARGET = process.env.DOKU_WEBHOOK_TARGET || '/api/payments/notifications';

// Instance Axios Bersih
const dokuClient = axios.create();

class PaymentService {

    _createSignature(stringToSign) {
        return crypto.createHmac('sha256', DOKU_SECRET_KEY)
            .update(stringToSign)
            .digest('base64');
    }

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

        const body = {
            order: {
                amount: amountValue,
                invoice_number: booking.booking_id,
                currency: "IDR",
                callback_url: "http://localhost:5173/booking/success",
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

        console.log("🌐 Target URL:", DOKU_ORDER_URL);
        console.log("🕒 Timestamp :", timestamp);

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
        const finalSignatureHeader = "HMACSHA256=" + signature;

        const headers = {
            'Client-Id': DOKU_CLIENT_ID,
            'Request-Id': requestId,
            'Request-Timestamp': timestamp,
            'Signature': finalSignatureHeader,
            'Content-Type': 'application/json'
        };

        try {
            const response = await dokuClient.post(DOKU_ORDER_URL, body, { headers });

            console.log("========================================");
            console.log("DOKU RESPONSE:", JSON.stringify(response.data, null, 2));
            console.log("========================================");

            const paymentId = response.data.response.payment.id;     // <= 🔥 WAJIB DISIMPAN
            const paymentUrl = response.data.response.payment.url;
            const invoiceNumber = response.data.response.order.invoice_number;

            // ⬇⬇⬇ SIMPAN paymentId ke DB ⬇⬇⬇
            const updateQuery = `
            UPDATE bookings
            SET 
                payment_gateway_ref = $1,    -- <== SAVE payment.id KE SINI
                payment_qr_url = $2,
                amount_paid = $3,
                updated_at = NOW()
            WHERE booking_id = $4
            RETURNING *;
        `;

            await db.query(updateQuery, [
                paymentId,        // ⬅ Wajib: untuk check-status
                paymentUrl,
                amountValue,
                booking.booking_id
            ]);

            return {
                order_id: invoiceNumber,
                payment_id: paymentId,       // ⬅ kirim ke frontend
                payment_url: paymentUrl,
                total_amount: amountValue,
            };

        } catch (error) {
            if (error.response) {
                console.error("❌ DOKU Error Status:", error.response.status);
                console.error("❌ DOKU Error Data:", JSON.stringify(error.response.data, null, 2));
                const dokuMsg = error.response.data?.error?.message || "Gagal membuat link pembayaran";
                throw new ApiError(502, `Gagal dari DOKU: ${dokuMsg}`);
            } else {
                console.error("❌ Network Error:", error.message);
                throw new ApiError(502, `Gagal komunikasi dengan DOKU: ${error.message}`);
            }
        }
    }

    async handleDokuNotification(notificationPayload, headers) {
        const clientId = headers['client-id'];

        if (clientId !== DOKU_CLIENT_ID) {
            logger.warn(`Webhook Client ID mismatch: ${clientId}`);
        }

        const invoiceNumber = notificationPayload.order?.invoice_number || notificationPayload.transaction?.partnerReferenceNo;
        const status = notificationPayload.transaction?.status;

        if (!invoiceNumber) throw new ApiError(400, "Invoice tidak ditemukan di payload.");

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            if (status === 'SUCCESS') {
                const updateSuccess = `UPDATE bookings SET status = 'PAID', updated_at = NOW() WHERE booking_id = $1`;
                await client.query(updateSuccess, [invoiceNumber]);
                logger.info(`[WEBHOOK] Booking ${invoiceNumber} updated to PAID.`);
            } else if (status === 'FAILED' || status === 'EXPIRED') {
                const updateFail = `UPDATE bookings SET status = 'FAILED', updated_at = NOW() WHERE booking_id = $1`;
                await client.query(updateFail, [invoiceNumber]);
                logger.info(`[WEBHOOK] Booking ${invoiceNumber} updated to FAILED.`);
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