const crypto = require('crypto');
const axios = require('axios');
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');
const BookingService = require('./booking.service');
// Asumsi: UserService atau Auth Service memiliki fungsi untuk mengambil data user
const UserService = require('./user.service');

// Ambil kredensial DOKU dari environment variables
const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;
const DOKU_API_URL = process.env.DOKU_API_URL || 'https://api-sandbox.doku.com';
const DOKU_WEBHOOK_TARGET = process.env.DOKU_WEBHOOK_TARGET || '/api/v1/payments/notifications';

class PaymentService {

    /**
     * Membuat signature HMAC_SHA256 sesuai standar DOKU.
     */
    _createSignature(stringToSign) {
        return crypto.createHmac('sha256', DOKU_SECRET_KEY)
            .update(stringToSign)
            .digest('base64');
    }

    // ======================================================================
    // 🚀 METHOD BARU: ENTRY POINT DARI CONTROLLER
    // ======================================================================

    /**
     * @service generateQrCode
     * @desc Mengambil data booking/user, melakukan validasi, lalu memanggil createQrisCharge().
     * @param {string} bookingId 
     * @param {string} userId 
     * @returns {object} - Informasi pembayaran dari DOKU
     */
    async generateQrCode(bookingId, userId) {
        // Asumsi: Service memiliki method untuk mengambil data
        // Catatan: Pastikan Anda menyesuaikan pemanggilan UserService.getUserById jika berbeda
        const booking = await BookingService.getBookingById(bookingId);
        const user = await UserService.getUserById(userId);

        if (!booking) {
            throw new ApiError(404, 'Booking tidak ditemukan.');
        }

        // 1. Validasi Kepemilikan dan Status
        if (booking.user_id.toString() !== userId.toString()) {
            throw new ApiError(403, 'Akses ditolak: Anda bukan pemilik booking ini.');
        }

        if (booking.status !== 'PENDING') {
            throw new ApiError(409, `Booking sudah berstatus ${booking.status}.`);
        }

        // 2. Panggil fungsi utama DOKU
        return this.createQrisCharge(booking, user);
    }

    // ======================================================================
    // ⚙️ FUNGSI UTAMA: INTERAKSI DOKU API
    // ======================================================================

    /**
     * Membuat transaksi QRIS baru di DOKU.
     * Dipanggil SETELAH booking 'PENDING' dibuat.
     * Meng-UPDATE booking dengan data DOKU.
     *
     * @param {object} booking - Objek data booking DARI 'bookings'
     * @param {object} user - Objek data pengguna (dari 'users')
     * @returns {object} - Informasi pembayaran dari DOKU (qr_code_url, expires_at, total_amount)
     */
    async createQrisCharge(booking, user) {
        const endpoint = '/qris-mpm-payment/v1/generate-qris';
        const timestamp = new Date().toISOString();

        const partnerReferenceNo = booking.booking_id;
        const requestId = `REQ-${booking.booking_id}-${Date.now()}`;

        // Menggunakan Math.round karena harga IDR biasanya bilangan bulat
        const amountValue = Math.round(booking.amount_due);

        const body = {
            partnerReferenceNo: partnerReferenceNo,
            amount: {
                value: `${amountValue}`, // Menggunakan Math.round()
                currency: 'IDR',
            },
            customer: {
                name: user.full_name,
                email: user.email,
                phone: user.phone_number
            }
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

            const dokuResponse = response.data.response; // Asumsi response DOKU nested

            // 1. Update ke tabel 'bookings'
            const updateQuery = `
                UPDATE bookings
                SET 
                    payment_gateway_ref = $1, 
                    payment_qr_url = $2, 
                    payment_qr_expires_at = $3,
                    total_price_paid = $5 -- Update total price yang dibayar (jika ada perubahan)
                WHERE booking_id = $4
                RETURNING *;
            `;

            const updatedBooking = await db.query(updateQuery, [
                dokuResponse.partnerReferenceNo,
                dokuResponse.qrisUrl,
                dokuResponse.expiresAt,
                booking.booking_id,
                amountValue
            ]);

            logger.info(`Data pembayaran DOKU disimpan untuk booking_id: ${booking.booking_id}`);

            // 2. Kembalikan data yang dibutuhkan frontend
            return {
                order_id: dokuResponse.partnerReferenceNo,
                qr_code_url: dokuResponse.qrisUrl,
                expires_at: dokuResponse.expiresAt,
                total_amount: amountValue, // Menyertakan jumlah pembayaran yang sudah dibulatkan
            };

        } catch (error) {
            logger.error('DOKU API Error (createQrisCharge):', error.response?.data || error.message);
            throw new ApiError(502, 'Gagal membuat transaksi pembayaran dengan DOKU.');
        }
    }

    // ======================================================================
    // 📞 WEBHOOK: HANDLE NOTIFIKASI DOKU
    // ======================================================================

    /**
     * Memverifikasi dan menangani notifikasi webhook dari DOKU.
     */
    async handleDokuNotification(notificationPayload, headers) {
        const clientId = headers['client-id'];
        const requestId = headers['request-id'];
        const timestamp = headers['request-timestamp'];
        const signatureFromDoku = headers.signature;

        if (!clientId || !requestId || !timestamp || !signatureFromDoku) {
            throw new ApiError(400, 'Header notifikasi dari DOKU tidak lengkap.');
        }

        const bodyString = JSON.stringify(notificationPayload);
        const digest = crypto.createHash('sha256').update(bodyString).digest('base64');

        const requestTarget = DOKU_WEBHOOK_TARGET;
        const stringToSign = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

        // 1. Verifikasi Signature
        const generatedSignature = this._createSignature(stringToSign);
        if (`HMACSHA256=${generatedSignature}` !== signatureFromDoku) {
            logger.warn(`Invalid signature for DOKU notification. Request-Id: ${requestId}`);
            throw new ApiError(403, 'Signature tidak valid. Notifikasi tidak sah.');
        }

        // 2. Proses status transaksi
        const { partnerReferenceNo, transactionStatus } = notificationPayload.transaction;
        const amount = notificationPayload.transaction.amount.value; // Jumlah yang dibayar

        const bookingId = partnerReferenceNo;

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            if (transactionStatus === 'SUCCESS') {
                await BookingService.handleSuccessfulPayment(
                    bookingId,
                    amount,
                    'DOKU_QRIS',
                    client
                );
            } else if (transactionStatus === 'FAILED' || transactionStatus === 'EXPIRED') {
                await BookingService.updateBookingStatusByAdmin(
                    bookingId,
                    'FAILED',
                    null,
                    client
                );
            } else {
                // Status yang tidak memerlukan update ke DB (misal: PENDING, PROCESSING)
                logger.info(`Ignoring DOKU notification with status: ${transactionStatus} for booking_id: ${bookingId}`);
                // Karena tidak ada perubahan DB, kita COMMIT (atau tidak melakukan apa-apa)
                // Paling aman: Jika tidak ada perubahan, langsung release.
                await client.query('COMMIT');
                return;
            }

            await client.query('COMMIT');
            logger.info(`Webhook DOKU berhasil diproses untuk booking_id: ${bookingId}.`);

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error(`Gagal memproses webhook DOKU untuk booking_id: ${bookingId}`, error);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new PaymentService();