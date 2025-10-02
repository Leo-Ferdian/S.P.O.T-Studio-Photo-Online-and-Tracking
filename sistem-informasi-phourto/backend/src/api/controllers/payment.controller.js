const PaymentService = require('../services/payment.service');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger'); // Impor logger

class PaymentController {
    /**
     * Menangani notifikasi webhook yang masuk dari DOKU.
     */
    handleNotification = asyncHandler(async (req, res) => {
        // Log payload notifikasi yang masuk untuk keperluan debugging.
        // PENTING: Dalam mode produksi, pertimbangkan untuk tidak me-log seluruh body jika mengandung data sensitif.
        logger.info('Menerima notifikasi dari DOKU:', { body: req.body, headers: req.headers });

        // Panggil service untuk memvalidasi dan memproses notifikasi
        await PaymentService.handleDokuNotification(req.body, req.headers);

        // Kirim respons 200 OK yang simpel untuk memberitahu DOKU bahwa notifikasi telah berhasil diterima.
        // Ini adalah praktik terbaik untuk endpoint webhook.
        res.status(200).json({ status: 'Notification received' });
    });
}

module.exports = new PaymentController();