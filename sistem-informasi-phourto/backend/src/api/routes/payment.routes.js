const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware')

// Rute untuk menerima notifikasi dari Midtrans
// POST /api/payments/notifications
// Tidak perlu autentikasi karena ini dipanggil oleh Midtrans
// Endpoint ini TIDAK boleh dilindungi oleh authMiddleware atau isAdmin
// karena dipanggil oleh server Midtrans secara langsung(eksternal)
// dan harus bisa diakses tanpa autentikasi
/**
 * @route   POST /api/payments/:bookingId/qr
 * @desc    Membuat QR Code (QRIS) untuk booking tertentu
 * @access  Private (Diperlukan autentikasi user)
 */
// Tambahkan authMiddleware untuk memastikan hanya user terautentikasi yang bisa memanggil ini
router.post(
    '/:bookingId/qr',
    authMiddleware, // <-- PENTING: Lindungi rute ini!
    PaymentController.generateQrCode // <-- Panggil controller yang sesuai
);

/**
 * @route   POST /api/payments/notifications
 * @desc    Endpoint untuk menerima webhook notifikasi dari DOKU
 * @access  Public (Diakses oleh server DOKU)
 */
router.post('/notifications', PaymentController.handleDokuNotification);

module.exports = router;