const BookingService = require('../../services/booking.service');
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/responseHandler');
const { validationResult } = require('express-validator');

class AdminBookingController {
    // R: Read All Bookings
    getAllBookings = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10 } = req.query;
        const bookings = await BookingService.getAllBookings(
            parseInt(page, 10),
            parseInt(limit, 10)
        );
        new ApiResponse(res, 200, bookings, 'Semua data booking berhasil diambil.');
    });

    // U: Update Booking Status
    updateBookingStatus = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { status } = req.body;

        const updatedBooking = await BookingService.updateBookingStatusByAdmin(id, status);
        new ApiResponse(res, 200, updatedBooking, `Status booking berhasil diperbarui menjadi ${status}.`);
    });
}

module.exports = new AdminBookingController();