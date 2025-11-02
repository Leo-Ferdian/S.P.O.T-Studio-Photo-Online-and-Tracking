const BookingService = require('../../services/booking.service');
const asyncHandler = require('../../../utils/asyncHandler');
const apiResponse = require('../../../utils/apiResponse');
const { validationResult } = require('express-validator');
const apiError = require('../../../utils/apiError');
const { logger } = require('../../../utils/logger');

class AdminBookingController {

    /**
     * @route GET /api/admin/bookings
     */
    getAllBookings = asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const { status, branch_id } = req.query;
        const filters = { status, branch_id };

        // Bug 1 Fix: logger.info sekarang berfungsi
        logger.info(`Admin mengambil semua pesanan: Page ${page}, Limit ${limit}, Filters: ${JSON.stringify(filters)}`);

        const result = await BookingService.getAllBookings(page, limit, filters);

        new apiResponse(res, 200, result, 'Semua data booking berhasil diambil.');
    });

    /**
     * @route GET /api/admin/bookings/:bookingId
     * @desc (FUNGSI BARU) Mengambil detail satu booking (untuk Admin)
     */
    getBookingDetailsByAdmin = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        const { bookingId } = req.params;
        const bookingDetails = await BookingService.getBookingDetailsByAdmin(bookingId);

        new apiResponse(res, 200, bookingDetails, 'Detail booking berhasil diambil.');
    });


    /**
     * @route PUT /api/admin/bookings/:bookingId/status
     */
    updateBookingStatus = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        const { bookingId } = req.params;
        const { status } = req.body;

        const adminUserId = req.user.user_id;

        // Bug 1 Fix: logger.info sekarang berfungsi
        logger.info(`Admin (${adminUserId}) memperbarui status ${bookingId} menjadi ${status}`);

        const updatedBooking = await BookingService.updateBookingStatusByAdmin(
            bookingId,
            status,
            adminUserId
        );

        new apiResponse(res, 200, updatedBooking, 'Status booking berhasil diperbarui.');
    });

    /**
     * @route PUT /api/admin/bookings/:bookingId/reschedule
     */
    rescheduleBooking = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        const { bookingId } = req.params;
        const { newStartTime, newRoomId, reason } = req.body;
        const adminUserId = req.user.user_id;

        // Bug 1 Fix: logger.info sekarang berfungsi
        logger.info(`Admin (${adminUserId}) melakukan reschedule untuk ${bookingId}`);

        const rescheduledBooking = await BookingService.rescheduleBooking(
            bookingId,
            { newStartTime, newRoomId, reason },
            adminUserId
        );

        new apiResponse(res, 200, rescheduledBooking, 'Booking berhasil dijadwalkan ulang.');
    });
    // --- FUNGSI BARU DITAMBAHKAN DI SINI ---
    /**
     * @route GET /api/admin/bookings/recent
     * @desc Mengambil booking terbaru untuk dashboard
     */
    getRecentBookings = asyncHandler(async (req, res) => {
        // Ambil 'limit' dari query string, default-kan ke 5
        const limit = parseInt(req.query.limit, 10) || 5;

        // Panggil service (yang akan kita buat di langkah selanjutnya)
        const recentBookings = await BookingService.getRecentBookingsForAdmin(limit);

        // Kirim respons
        new apiResponse(res, 200, recentBookings, 'Booking terbaru berhasil diambil.');
    });
}

module.exports = new AdminBookingController();