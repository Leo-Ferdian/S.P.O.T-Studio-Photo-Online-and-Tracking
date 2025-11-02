// src/api/controllers/payment.controller.js
const PaymentService = require('../services/payment.service');
const asyncHandler = require('../../utils/asyncHandler');
const { logger } = require('../../utils/logger');

class PaymentController {
    
    /**
     * Menangani webhook notifikasi yang masuk dari DOKU
     */
    handleDokuNotification = asyncHandler(async (req, res) => {
        const notificationPayload = req.body;
        const headers = req.headers;

        logger.info('Menerima notifikasi webhook DOKU:', notificationPayload);

        // Memanggil service Anda yang sudah ada
        await PaymentService.handleDokuNotification(notificationPayload, headers);
        
        // Kirim respons sukses "OK" ke DOKU
        res.status(200).json({ status: 'OK' });
    });
}

module.exports = new PaymentController();