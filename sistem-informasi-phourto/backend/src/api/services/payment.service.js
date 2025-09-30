const crypto = require('crypto');
const axios = require('axios');
const db = require('../../config/database');
const logger = require('../../utils/logger');
const apiError = require('../../utils/apiError');
const BookingService = require('./booking.service'); // Kita akan panggil service lain

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.midtrans.com/v2/charge' 
    : 'https://api.sandbox.midtrans.com/v2/charge';

class PaymentService {

    /**
     * Membuat transaksi pembayaran melalui Midtrans.
     * @param {object} booking - Data booking (id, total_amount).
     * @param {object} user - Data user (full_name, email, whatsapp_number).
     * @param {string} paymentType - Tipe pembayaran (e.g., 'qris', 'gopay').
     * @param {object} options - Opsi tambahan untuk Midtrans (e.g., bank untuk transfer).
     * @returns {object} - Data respon dari Midtrans.
     */
    async createTransaction(booking, user, paymentType, options = {}) {
        if (!MIDTRANS_SERVER_KEY) {
            logger.error('MIDTRANS_SERVER_KEY is not configured in .env file.');
            throw new apiError(500, 'Konfigurasi server pembayaran tidak ditemukan.');
        }

        const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${authString}`,
            'X-Idempotency-Key': `SPOT-IK-${booking.id}-${Date.now()}` // Mencegah duplikat request
        };

        const body = {
            payment_type: paymentType,
            transaction_details: {
                order_id: `SPOT-${booking.id}-${new Date().getTime()}`, // Lebih unik
                gross_amount: parseFloat(booking.total_amount),
            },
            customer_details: {
                first_name: user.full_name,
                email: user.email,
                phone: user.whatsapp_number,
            },
            ...options,
        };

        try {
            const response = await axios.post(MIDTRANS_API_URL, body, { headers });
            
            // Simpan detail pembayaran ke database
            await this.savePaymentDetails(booking.id, response.data);

            return response.data;
        } catch (error) {
            logger.error('Midtrans API Error:', error.response?.data || error.message);
            throw new apiError(502, 'Gagal membuat transaksi pembayaran dengan payment gateway.');
        }
    }

    /**
     * Menyimpan detail awal transaksi pembayaran ke tabel 'payments'.
     * @param {number} bookingId - ID dari booking terkait.
     * @param {object} midtransResponse - Respon dari Midtrans setelah create transaction.
     */
    async savePaymentDetails(bookingId, midtransResponse) {
        const {
            transaction_id,
            order_id,
            gross_amount,
            payment_type,
            transaction_status,
            expiry_time,
            actions
        } = midtransResponse;

        // Cari URL QR code dari array 'actions' jika ada
        const qrCodeAction = actions?.find(action => action.name === 'generate-qr-code');
        const qr_code_url = qrCodeAction ? qrCodeAction.url : null;
        
        const query = `
            INSERT INTO phourto.payments 
            (booking_id, transaction_id, order_id, gross_amount, payment_type, qr_code_url, expires_at, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (order_id) DO NOTHING;
        `;
        
        const values = [
            bookingId,
            transaction_id,
            order_id,
            gross_amount,
            payment_type,
            qr_code_url,
            expiry_time,
            transaction_status?.toUpperCase() || 'PENDING'
        ];

        try {
            await db.query(query, values);
            logger.info(`Payment details saved for order_id: ${order_id}`);
        } catch (dbError) {
            logger.error(`Failed to save payment details for order_id ${order_id}:`, dbError);
            // Tidak melempar error ke user, cukup log karena transaksi di Midtrans sudah dibuat.
        }
    }

    /**
     * Menangani notifikasi webhook dari Midtrans.
     * @param {object} notificationPayload - Body notifikasi dari Midtrans.
     * @returns {boolean} - True jika berhasil diproses.
     */
    async handlePaymentNotification(notificationPayload) {
        const { order_id, transaction_status, fraud_status, signature_key, gross_amount } = notificationPayload;

        // 1. Verifikasi Signature Key (SANGAT PENTING!)
        this.verifySignature(notificationPayload);

        // 2. Cek status transaksi di Midtrans untuk memastikan keaslian (Best Practice)
        const isStatusValid = await this.validateTransactionStatus(order_id, gross_amount);
        if (!isStatusValid) {
            logger.warn(`Transaction status validation failed for order_id: ${order_id}. Ignoring notification.`);
            throw new apiError(400, 'Status transaksi tidak cocok dengan data dari Midtrans.');
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            // 3. Update status di tabel 'payments'
            const updatedPayment = await this.updatePaymentStatus(client, order_id, transaction_status);
            if (!updatedPayment) {
                logger.warn(`Payment with order_id ${order_id} not found. Skipping update.`);
                await client.query('ROLLBACK');
                 return; // Keluar jika pembayaran tidak ditemukan
            }

            const bookingId = updatedPayment.booking_id;
            let newBookingStatus = null;
            let uniqueCode = null;

            // 4. Tentukan status booking baru berdasarkan status pembayaran
            if (transaction_status === 'settlement' && fraud_status === 'accept') {
                newBookingStatus = 'PAID';
                uniqueCode = `PHR-${Date.now()}-${bookingId}`; // Generate unique code
            } else if (transaction_status === 'expire') {
                newBookingStatus = 'EXPIRED';
            } else if (['cancel', 'deny'].includes(transaction_status)) {
                newBookingStatus = 'CANCELLED';
            }

            // 5. Jika ada status booking baru, update tabel booking
            if (newBookingStatus) {
                await BookingService.updateBookingStatusAndCode(client, bookingId, newBookingStatus, uniqueCode);
            }

            await client.query('COMMIT');
            logger.info(`Notification for order_id ${order_id} processed successfully. Booking status: ${newBookingStatus}`);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error(`Error handling notification for order_id ${order_id}:`, error);
            throw error; // Lempar error agar bisa di-handle di controller
        } finally {
            client.release();
        }
    }

    /**
     * Memverifikasi signature key dari notifikasi Midtrans.
     * @param {object} payload - Body notifikasi.
     */
    verifySignature(payload) {
        const { order_id, status_code, gross_amount, signature_key } = payload;
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const hash = crypto.createHash('sha512').update(`${order_id}${status_code}${gross_amount}${serverKey}`).digest('hex');

        if (signature_key !== hash) {
            logger.warn(`Invalid signature for order_id: ${order_id}`);
            throw new apiError(403, 'Signature tidak valid. Notifikasi tidak sah.');
        }
    }
    
    /**
     * Memvalidasi status transaksi langsung ke API Midtrans.
     * @param {string} order_id
     * @param {string} gross_amount
     * @returns {boolean}
     */
    async validateTransactionStatus(order_id, gross_amount) {
        const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
        try {
            const response = await axios.get(
                `${process.env.NODE_ENV === 'production' ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'}/v2/${order_id}/status`,
                { headers: { 'Authorization': `Basic ${authString}` } }
            );

            // Cocokkan amount untuk keamanan ekstra
            return response.data && response.data.gross_amount == gross_amount;
        } catch (error) {
            logger.error(`Failed to validate transaction status for order_id ${order_id}:`, error.response?.data || error.message);
            return false;
        }
    }
    
    /**
     * Helper untuk update status di tabel payments di dalam sebuah transaksi DB.
     * @param {object} client - Klien database PostgreSQL.
     * @param {string} orderId
     * @param {string} status
     * @returns {object|null} - Data pembayaran yang diupdate atau null jika tidak ada.
     */
    async updatePaymentStatus(client, orderId, status) {
        const result = await client.query(
            "UPDATE phourto.payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2 RETURNING *",
            [status.toUpperCase(), orderId]
        );
        return result.rows[0] || null;
    }
}

module.exports = new PaymentService();
