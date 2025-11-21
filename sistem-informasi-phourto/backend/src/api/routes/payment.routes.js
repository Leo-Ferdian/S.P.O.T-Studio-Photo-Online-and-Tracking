const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/payments/:bookingId/qr
 * @desc    Membuat QR Code (QRIS) untuk booking tertentu
 * @access  Private (Diperlukan autentikasi user)
 */
router.post(
    '/:bookingId/qr',
    authMiddleware,
    PaymentController.generateQrCode
);

/**
 * @route   GET /api/payments/check/:bookingId
 * @desc    ✅ ROUTE BARU: Cek status pembayaran Real-time ke DOKU
 * Dipanggil oleh Frontend saat di halaman Success
 * @access  Private (User yang login)
 */
router.get(
    '/check/:bookingId',
    authMiddleware, // User harus login untuk cek status pesanan mereka
    PaymentController.checkStatus
);

/**
 * @route   POST /api/payments/notifications
 * @desc    Endpoint untuk menerima webhook notifikasi dari DOKU
 * @access  Public (Diakses oleh server DOKU)
 */
router.post('/notifications', PaymentController.handleDokuNotification);

module.exports = router;