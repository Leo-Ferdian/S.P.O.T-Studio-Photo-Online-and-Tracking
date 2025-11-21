const PaymentService = require('../services/payment.service');
const asyncHandler = require('../../utils/asyncHandler');
const { logger } = require('../../utils/logger');
// const CustomError = require('../../utils/customError'); // Mungkin diperlukan

class PaymentController {

    // --- METHOD BARU: GENERATE QR CODE ---
    generateQrCode = asyncHandler(async (req, res) => {
        const { bookingId } = req.params;
        const userId = req.user.user_id;

        if (!bookingId) {
            return res.status(400).json({ message: 'ID Booking diperlukan.' });
        }

        logger.info(`Membuat QR Code DOKU untuk Booking ID: ${bookingId} oleh User: ${userId}`);

        // Panggil Payment Service
        const paymentData = await PaymentService.generateQrCode(bookingId, userId);

        // paymentData = { qr_code_url, expires_at, total_amount, ... }
        res.status(200).json({
            status: 'success',
            message: 'QR Code berhasil dibuat.',
            data: paymentData,
        });
    });

    // --- ✅ TAMBAHAN: CEK STATUS TRANSAKSI (Method Baru) ---
    // Dipanggil frontend saat user masuk halaman success
    checkStatus = asyncHandler(async (req, res) => {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({ message: 'Booking ID diperlukan' });
        }

        logger.info(`Mengecek status pembayaran (Real-time DOKU) untuk Booking ID: ${bookingId}`);

        // Panggil method baru di Service yang baru saja kita perbaiki
        const result = await PaymentService.checkTransactionStatus(bookingId);

        res.status(200).json({
            status: 'success',
            data: result
        });
    });

    // --- METHOD LAMA: HANDLE WEBHOOK ---
    handleDokuNotification = asyncHandler(async (req, res) => {
        // ... (Kode Anda yang sudah ada)
        const notificationPayload = req.body;
        const headers = req.headers;

        logger.info('Menerima notifikasi webhook DOKU:', notificationPayload);

        await PaymentService.handleDokuNotification(notificationPayload, headers);

        res.status(200).json({ status: 'OK' });
    });
}

module.exports = new PaymentController();