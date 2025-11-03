const crypto = require('crypto');
const axios = require('axios');
const db = require('../../config/database'); // Koneksi V1.6
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');
const BookingService = require('./booking.service');

// Ambil kredensial DOKU dari environment variables
const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID;
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY;
const DOKU_API_URL = process.env.DOKU_API_URL || 'https://api-sandbox.doku.com';
const DOKU_WEBHOOK_TARGET = process.env.DOKU_WEBHOOK_TARGET || '/api/v1/payments/notifications'; // Sesuaikan dengan target webhook Anda

class PaymentService {

    /**
     * Membuat signature HMAC_SHA256 sesuai standar DOKU.
     */
    _createSignature(stringToSign) {
        return crypto.createHmac('sha256', DOKU_SECRET_KEY)
            .update(stringToSign)
            .digest('base64');
    }

    /**
     * Membuat transaksi QRIS baru di DOKU.
     * --- REFACTORED (V1.7) ---
     * Dipanggil SETELAH booking 'PENDING' dibuat.
     * Meng-UPDATE booking dengan data DOKU.
     *
     * @param {object} booking - Objek data booking DARI 'bookings' (termasuk booking_id, total_price)
     * @param {object} user - Objek data pengguna (dari 'users')
     * @returns {object} - Informasi pembayaran dari DOKU (qr_code_url, expires_at)
     */
    async createQrisCharge(booking, user) {
        const endpoint = '/qris-mpm-payment/v1/generate-qris';
        const timestamp = new Date().toISOString();

        // REFAKTOR: Gunakan 'booking_id' sebagai referensi utama
        // Ini membuat pemetaan webhook 100% andal.
        const partnerReferenceNo = booking.booking_id; // WAJIB: Gunakan booking_id
        const requestId = `REQ-${booking.booking_id}-${Date.now()}`; // ID unik untuk request API DOKU

        const body = {
            partnerReferenceNo: partnerReferenceNo, // Ini adalah ID yang dilacak DOKU
            amount: {
                // Gunakan total_price (lunas) atau dp_amount tergantung logika bisnis
                // Untuk saat ini, kita gunakan 'amount_due' (yang di-generate)
                value: `${booking.amount_due.toFixed(2)}`,
                currency: 'IDR',
            },
            // (Opsional) Tambahkan info pelanggan
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

            const dokuResponse = response.data;

            // --- REFAKTOR (V1.7) ---
            // Hapus 'savePaymentDetails()'
            // Ganti dengan UPDATE ke tabel 'bookings'

            const updateQuery = `
                UPDATE bookings
                SET 
                    payment_gateway_ref = $1, -- Menyimpan 'partnerReferenceNo'
                    payment_qr_url = $2,      -- Menyimpan 'qrisUrl'
                    payment_qr_expires_at = $3 -- Menyimpan 'expiresAt'
                WHERE booking_id = $4;
            `;

            await db.query(updateQuery, [
                dokuResponse.partnerReferenceNo, // partnerReferenceNo (harus = booking_id kita)
                dokuResponse.qrisUrl,
                dokuResponse.expiresAt,
                booking.booking_id
            ]);

            logger.info(`Data pembayaran DOKU disimpan untuk booking_id: ${booking.booking_id}`);

            return {
                order_id: dokuResponse.partnerReferenceNo, // = booking_id
                qr_code_url: dokuResponse.qrisUrl,
                expires_at: dokuResponse.expiresAt,
            };

        } catch (error) {
            logger.error('DOKU API Error (createQrisCharge):', error.response?.data || error.message);
            // Batalkan booking jika gagal membuat pembayaran? (Logika opsional)
            // await BookingService.updateBookingStatusByAdmin(booking.booking_id, 'FAILED', null);
            throw new ApiError(502, 'Gagal membuat transaksi pembayaran dengan DOKU.');
        }
    }

    /**
     * FUNGSI savePaymentDetails() DIHAPUS
     * (Logika digabung ke V1.7 'bookings' table)
     */

    /**
     * Memverifikasi dan menangani notifikasi webhook dari DOKU.
     * --- REFACTORED (V1.7) ---
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

        // PENTING: Pastikan ini adalah target endpoint webhook Anda
        const requestTarget = DOKU_WEBHOOK_TARGET;
        const stringToSign = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

        // 1. Verifikasi Signature
        const generatedSignature = this._createSignature(stringToSign);
        if (`HMACSHA256=${generatedSignature}` !== signatureFromDoku) {
            logger.warn(`Invalid signature for DOKU notification. Request-Id: ${requestId}`);
            throw new ApiError(403, 'Signature tidak valid. Notifikasi tidak sah.');
        }

        // 2. Proses status transaksi
        // Ambil data penting dari payload
        const { partnerReferenceNo, transactionStatus } = notificationPayload.transaction;
        const amount = notificationPayload.transaction.amount.value; // Jumlah yang dibayar

        // 'partnerReferenceNo' adalah 'booking_id' kita
        const bookingId = partnerReferenceNo;

        // 3. Update database dalam transaksi
        const client = await db.getClient(); // Gunakan getClient (V1.6)
        try {
            await client.query('BEGIN');

            // --- REFAKTOR (V1.7) ---
            // Hapus logika 'phourto.payments'.
            // Langsung panggil BookingService.

            if (transactionStatus === 'SUCCESS') {
                // Panggil fungsi V1.7 dari BookingService (yang sudah di-refactor)
                // Kita harus meneruskan 'client' agar berjalan dalam transaksi yang sama
                await BookingService.handleSuccessfulPayment(
                    bookingId,
                    amount,
                    'DOKU_QRIS',
                    client // <--- Meneruskan klien transaksi
                );

            } else if (transactionStatus === 'FAILED') {
                // Panggil fungsi V1.7 dari BookingService (yang sudah di-refactor)
                // Kita perlu menambahkan 'FAILED' ke ENUM status kita
                // null untuk adminUserId karena ini adalah aksi sistem
                await BookingService.updateBookingStatusByAdmin(
                    bookingId,
                    'FAILED',
                    null, // adminUserId (null = sistem)
                    client // <--- Meneruskan klien transaksi
                );

            } else {
                logger.info(`Ignoring DOKU notification with status: ${transactionStatus}`);
                // Kita tidak COMMIT atau ROLLBACK, biarkan saja
                await client.query('COMMIT'); // Atau ROLLBACK? Sebaiknya COMMIT agar tidak menggantung.
                return;
            }

            await client.query('COMMIT');
            logger.info(`Webhook DOKU berhasil diproses untuk booking_id: ${bookingId}.`);

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error(`Gagal memproses webhook DOKU untuk booking_id: ${bookingId}`, error);
            // Kirim 500 ke DOKU agar mereka mencoba lagi
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new PaymentService();
