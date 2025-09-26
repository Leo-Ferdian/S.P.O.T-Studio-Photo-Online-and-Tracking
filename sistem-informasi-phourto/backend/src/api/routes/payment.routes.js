const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');

// Rute untuk menerima notifikasi dari Midtrans
// POST /api/payments/notifications
router.post('/notifications', PaymentController.handleNotification);

module.exports = router;