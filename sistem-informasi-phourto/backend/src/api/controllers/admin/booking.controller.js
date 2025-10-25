const BookingService = require('../../services/booking.service'); // Kita gunakan service yang sama
const asyncHandler = require('../../../utils/asyncHandler');
const apiResponse = require('../../../utils/apiResponse');
const { validationResult } = require('express-validator');
const apiError = require('../../../utils/apiError');

class AdminBookingController {

    // GET /api/admin/bookings
    getAllBookings = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Panggil fungsi 'getAllBookings' dari service Anda
        const result = await BookingService.getAllBookings(page, limit);
        
        new apiResponse(res, 200, result, 'Semua data booking berhasil diambil.');
    });

    // PUT /api/admin/bookings/:id/status
    updateBookingStatus = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        const { id } = req.params;
        const { status } = req.body; // status sudah divalidasi

        // Panggil fungsi 'updateBookingStatusByAdmin' dari service Anda
        const updatedBooking = await BookingService.updateBookingStatusByAdmin(id, status);

        new apiResponse(res, 200, updatedBooking, 'Status booking berhasil diperbarui.');
    });
}

module.exports = new AdminBookingController();