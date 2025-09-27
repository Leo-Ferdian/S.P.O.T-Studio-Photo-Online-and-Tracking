const crypto = require('crypto');
const axios = require('axios');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');
const BookingService = require('./booking.service'); // <-- Impor BookingService

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_API_URL = 'https://api.sandbox.midtrans.com/v2/charge';

class PaymentService {
    /**
     * Membuat transaksi Midtrans. (Fungsi ini sudah sangat baik, tidak perlu diubah)
     */
    async createTransaction(booking, user, paymentType, options = {}) {
        const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${authString}`
        };

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
            ...options
        };

        try {
            const response = await axios.post(MIDTRANS_API_URL, body, { headers });
            return response.data;
        } catch (error) {
            logger.error('Midtrans API Error:', error.response?.data || error.message);

            throw new ApiError(502, 'Gagal membuat transaksi pembayaran.');
        }
    }

    /**
     * Menangani notifikasi dari Midtrans dan mendelegasikannya ke service yang relevan.
     */
    async handlePaymentNotification(notificationPayload) {
        const { order_id, transaction_status, fraud_status, signature_key, gross_amount } = notificationPayload;

        // 1. Verifikasi Signature Key (Tetap di sini karena ini adalah logika pembayaran)
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const hash = crypto.createHash('sha512').update(`${order_id}${transaction_status}${gross_amount}${serverKey}`).digest('hex');

        if (signature_key!== hash) {
            logger.warn(`Invalid signature for order_id: ${order_id}`);
            throw new ApiError(403, 'Signature tidak valid. Notifikasi tidak sah.');
        }

        // 2. Tentukan status booking baru
        let newBookingStatus;
        if (transaction_status == 'settlement' && fraud_status == 'accept') {
            newBookingStatus = 'PAID';
        } else if (transaction_status == 'expire') {
            newBookingStatus = 'EXPIRED';
        } else if (transaction_status == 'cancel' || transaction_status == 'deny') {
            newBookingStatus = 'CANCELLED';
        } else {
            logger.info(`Ignoring notification for order_id: ${order_id} with status: ${transaction_status}`);
            return; // Abaikan status lain seperti 'pending'
        }

        // 3. DELEGASIKAN tugas ke BookingService
        // PaymentService tidak perlu tahu cara memperbarui booking, ia hanya memberi perintah.
        try {
            if (newBookingStatus === 'PAID') {
                await BookingService.processSuccessfulPayment(order_id);
            } else {
                await BookingService.processFailedPayment(order_id, newBookingStatus);
            }
        } catch (error) {
            logger.error(`Error processing notification for order_id ${order_id}:`, error);
            // Tidak perlu melempar error lagi karena controller sudah merespons 200 OK
        }
    }
}

module.exports = new PaymentService();