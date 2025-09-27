const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');

// Rute untuk menerima notifikasi dari Midtrans
// POST /api/payments/notifications
// Tidak perlu autentikasi karena ini dipanggil oleh Midtrans
// Endpoint ini TIDAK boleh dilindungi oleh authMiddleware atau isAdmin
// karena dipanggil oleh server Midtrans secara langsung(eksternal)
// dan harus bisa diakses tanpa autentikasi
router.post('/notifications', PaymentController.handleNotification);

module.exports = router;