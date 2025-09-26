const PaymentService = require('../services/payment.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

class PaymentController {
    handleNotification = asyncHandler(async (req, res) => {
        const notificationPayload = req.body;
        await PaymentService.handlePaymentNotification(notificationPayload);
        // Penting untuk merespons 200 OK agar Midtrans tahu notifikasi diterima
        new apiResponse(res, 200, null, 'Notifikasi pembayaran diterima.');
    });
}

module.exports = new PaymentController();