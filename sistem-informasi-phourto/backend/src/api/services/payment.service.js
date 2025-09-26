const crypto = require('crypto'); // Untuk generate hash
const axios = require('axios'); // Untuk HTTP requests
const apiError = require('../../utils/apiError');

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_API_URL = 'https://api.sandbox.midtrans.com/v2/charge'; // ganti ke production saat live https://api.midtrans.com/v2/charge

class PaymentService {
    /**
     * Membuat transaksi Midtrans dengan berbagai metode pembayaran.
     * @param {object} booking - Data booking (id, total_amount).
     * @param {object} user - Data user (full_name, email, whatsapp_number).
     * @param {string} paymentType - Jenis pembayaran (qris, gopay, shopeepay, bank_transfer, credit_card, dll).
     * @param {object} options - Tambahan konfigurasi khusus tiap payment method.
     * @param {object} notificationPayload - Payload notifikasi dari Midtrans.
     * @returns {object} - Response dari Midtrans.
     */
    async createTransaction(booking, user, paymentType, options = {}) {
        const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${authString}`
        };

        // Body dasar transaksi
        const body = {
            payment_type: paymentType,
            transaction_details: {
                order_id: `SPOT-${booking.id}-${Date.now()}`,
                gross_amount: parseFloat(booking.total_amount)
            },
            customer_details: {
                first_name: user.full_name,
                email: user.email,
                phone: user.whatsapp_number
            },
            ...options // merge opsi tambahan sesuai payment type
            
        };

        try {
            const response = await axios.post(MIDTRANS_API_URL, body, { headers });
            return response.data;
        } catch (error) {
            console.error('Midtrans API Error:', error.response?.data || error.message);
            throw new apiError (502, 'Gagal membuat transaksi pembayaran.');
        }
    }

    // Menangani notifikasi dari Midtrans
    async handlePaymentNotification(notificationPayload) {
        const { order_id, transaction_status, fraud_status, signature_key, gross_amount } = notificationPayload;

        // 1. Verifikasi Signature Key untuk keamanan (SANGAT PENTING)
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const hash = crypto.createHash('sha512').update(`${order_id}${transaction_status}${gross_amount}${serverKey}`).digest('hex');

        if (signature_key!== hash) {
            throw new apiError(403, 'Signature tidak valid. Notifikasi tidak sah.');
        }

        // 2. Ekstrak booking ID dari order_id
        const bookingId = order_id.split('-')[1];

        // 3. Proses notifikasi berdasarkan status
        if (transaction_status == 'settlement' && fraud_status == 'accept') {
            // Pembayaran berhasil dan aman
            const client = await db.connect();
            try {
                await client.query('BEGIN');

                // Update status booking menjadi 'PAID'
                await client.query(
                    "UPDATE phourto.bookings SET status = 'PAID', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'PENDING_PAYMENT'",
                    [bookingId]
                );

                // Buat Kode Unik untuk pelanggan
                const uniqueCode = `PHR-${Date.now()}-${bookingId}`;
                await client.query(
                    'UPDATE phourto.bookings SET unique_code = $1 WHERE id = $2',
                    [uniqueCode, bookingId]
                );

                await client.query('COMMIT');
                console.log(`Booking ID ${bookingId} berhasil dibayar.`);
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } else if (transaction_status == 'expire') {
            // Pembayaran kedaluwarsa
            await db.query("UPDATE phourto.bookings SET status = 'EXPIRED' WHERE id = $1", [bookingId]);
            console.log(`Booking ID ${bookingId} telah kedaluwarsa.`);
        } else if (transaction_status == 'cancel' || transaction_status == 'deny') {
            // Pembayaran dibatalkan atau ditolak
            await db.query("UPDATE phourto.bookings SET status = 'CANCELLED' WHERE id = $1", [bookingId]);
            console.log(`Booking ID ${bookingId} telah dibatalkan/ditolak.`);
        }
    }
}

module.exports = new PaymentService();