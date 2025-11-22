const BookingService = require('../services/booking.service');
// PackageService tidak lagi diperlukan di sini, biarkan service yang menanganinya
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');

class BookingController {

    /**
     * @route GET /api/bookings/availability
     * @desc (REFACTORED V1.14) Mengambil SEMUA slot waktu yang tersedia
     * @access Terproteksi (Customer)
     */
    checkAvailability = asyncHandler(async (req, res) => {
        // 1. Validasi (kita asumsikan sudah berjalan di rute)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        // 2. Ambil data baru (packageId dan date) dari query
        const { packageId, startTime } = req.query;

        // 3. Panggil service BARU (yang akan kita buat di langkah selanjutnya)
        // Service ini akan melakukan semua perhitungan slot
        const availableSlots = await BookingService.getAvailableSlots(
            packageId,
            startTime
        );

        // 4. Kembalikan array slot
        new apiResponse(res, 200, { availableSlots }, 'Slot yang tersedia berhasil diambil.');
    });

    /**
     * @route POST /api/bookings
     */
    createBooking = asyncHandler(async (req, res) => {
        // ... (Fungsi ini tidak berubah) ...
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal.',
                errors: errors.array()
            });
        }
        const userId = req.user.user_id;
        const newBooking = await BookingService.createBooking(userId, req.body);
        new apiResponse(res, 201, newBooking, 'Booking berhasil dibuat (status PENDING).');
    });

    /**
     * @route GET /api/bookings/my-bookings
     */
    getMyBookings = asyncHandler(async (req, res) => {
        // ... (Fungsi ini tidak berubah) ...
        const userId = req.user.user_id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const result = await BookingService.getMyBookings(userId, page, limit);
        new apiResponse(res, 200, result, 'Riwayat booking berhasil diambil.');
    });

    /**
     * @route GET /api/bookings/:bookingId
     */
    getBookingById = asyncHandler(async (req, res) => {
        // ... (Fungsi ini tidak berubah) ...
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi bookingId gagal.',
                errors: errors.array()
            });
        }
        const userId = req.user.user_id;
        const { bookingId } = req.params;
        const result = await BookingService.getBookingById(bookingId, userId);
        new apiResponse(res, 200, result, 'Detail booking berhasil diambil.');
    });
}

module.exports = new BookingController();