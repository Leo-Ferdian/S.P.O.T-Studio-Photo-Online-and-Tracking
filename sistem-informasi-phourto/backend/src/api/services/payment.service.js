const crypto = require('crypto');
const axios = require('axios');
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const BookingService = require('./booking.service');

// Ambil kredensial DOKU dari environment variables
const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;
const DOKU_API_URL = 'https://api-sandbox.doku.com'; // Gunakan URL Sandbox DOKU untuk pengembangan

class PaymentService {

    /**
     * Membuat signature HMAC_SHA256 sesuai standar DOKU.
     * @param {string} stringToSign - String yang akan di-hash.
     * @returns {string} - Digest dalam format base64.
     */
    _createSignature(stringToSign) {
        return crypto.createHmac('sha256', DOKU_SECRET_KEY)
            .update(stringToSign)
            .digest('base64');
    }

    /**
     * Membuat transaksi QRIS baru di DOKU.
     * @param {object} booking - Objek data booking.
     * @param {object} user - Objek data pengguna.
     * @returns {object} - Informasi pembayaran dari DOKU.
     */
    async createQrisCharge(booking, user) {
        const endpoint = '/qris-mpm-payment/v1/generate-qris';
        const timestamp = new Date().toISOString();
        const requestId = `SPOT-${booking.id}-${Date.now()}`;

        const body = {
            partnerReferenceNo: requestId,
            amount: {
                value: `${booking.total_amount.toFixed(2)}`,
                currency: 'IDR',
            },
        };

        const bodyString = JSON.stringify(body);
        const digest = crypto.createHash('sha256').update(bodyString).digest('base64');
        const stringToSign = `Client-Id:${DOKU_CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${endpoint}\nDigest:${digest}`;
        
        const signature = this._createSignature(stringToSign);

        const headers = {
            'Client-Id': DOKU_CLIENT_ID,
            'Request-Id': requestId,
            'Request-Timestamp': timestamp,
            'Signature': `HMACSHA256=${signature}`,
        };

        try {
            const response = await axios.post(`${DOKU_API_URL}${endpoint}`, body, { headers });
            
            // Simpan detail pembayaran ke database kita
            await this.savePaymentDetails(booking.id, response.data, requestId);

            return {
                order_id: requestId, // Kita gunakan requestId sebagai order_id internal
                qr_code_url: response.data.qrisUrl,
                expires_at: response.data.expiresAt,
            };
        } catch (error) {
            logger.error('DOKU API Error:', error.response?.data || error.message);
            throw new ApiError(502, 'Gagal membuat transaksi pembayaran dengan DOKU.');
        }
    }

    /**
     * Menyimpan detail awal transaksi pembayaran ke tabel 'payments'.
     */
    async savePaymentDetails(bookingId, dokuResponse, requestId) {
        const query = `
            INSERT INTO phourto.payments 
            (booking_id, transaction_id, order_id, gross_amount, payment_type, qr_code_url, expires_at, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (order_id) DO NOTHING;
        `;
        const values = [
            bookingId,
            dokuResponse.partnerReferenceNo, // Menggunakan partnerReferenceNo sebagai transaction_id
            requestId,
            parseFloat(dokuResponse.amount.value),
            'QRIS_DOKU',
            dokuResponse.qrisUrl,
            dokuResponse.expiresAt,
            'PENDING'
        ];
        await db.query(query, values);
        logger.info(`Payment details saved for order_id: ${requestId}`);
    }

    /**
     * Memverifikasi dan menangani notifikasi webhook dari DOKU.
     */
    async handleDokuNotification(notificationPayload, headers) {
        // Ambil header yang diperlukan untuk verifikasi signature
        const clientId = headers['client-id'];
        const requestId = headers['request-id'];
        const timestamp = headers['request-timestamp'];
        const signatureFromDoku = headers.signature;

        if (!clientId || !requestId || !timestamp || !signatureFromDoku) {
            throw new ApiError(400, 'Header notifikasi dari DOKU tidak lengkap.');
        }

        const bodyString = JSON.stringify(notificationPayload);
        const digest = crypto.createHash('sha256').update(bodyString).digest('base64');
        
        // Sesuaikan target endpoint webhook Anda
        const requestTarget = '/api/payments/notifications'; 
        const stringToSign = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
        
        // 1. Verifikasi Signature
        const generatedSignature = this._createSignature(stringToSign);
        if (`HMACSHA256=${generatedSignature}` !== signatureFromDoku) {
            logger.warn(`Invalid signature for DOKU notification. Request-Id: ${requestId}`);
            throw new ApiError(403, 'Signature tidak valid. Notifikasi tidak sah.');
        }

        // 2. Proses status transaksi
        const { partnerReferenceNo, transactionStatus } = notificationPayload.transaction;
        let newPaymentStatus;

        if (transactionStatus === 'SUCCESS') {
            newPaymentStatus = 'PAID';
        } else if (transactionStatus === 'FAILED') {
            newPaymentStatus = 'FAILED';
        } else {
            logger.info(`Ignoring DOKU notification with status: ${transactionStatus}`);
            return;
        }
        
        // 3. Update database dalam transaksi
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const paymentResult = await client.query(
                "UPDATE phourto.payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE transaction_id = $2 RETURNING booking_id",
                [newPaymentStatus, partnerReferenceNo]
            );

            if (paymentResult.rows.length > 0) {
                const { booking_id } = paymentResult.rows[0];
                if (newPaymentStatus === 'PAID') {
                    await BookingService.finalizeSuccessfulBooking(booking_id, client);
                } else {
                    await BookingService.updateBookingStatus(booking_id, 'CANCELLED', client); // Atau status FAILED jika ada
                }
            }
            await client.query('COMMIT');
            logger.info(`Webhook DOKU processed for partnerReferenceNo: ${partnerReferenceNo}.`);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error(`Failed to process DOKU webhook for partnerReferenceNo: ${partnerReferenceNo}`, error);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new PaymentService();