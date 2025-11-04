const BookingService = require('../services/booking.service');
const PackageService = require('../services/package.service'); // <-- IMPOR BARU
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');
const ApiError = require('../../utils/apiError'); 
const { logger } = require('../../utils/logger'); // (V1.9.5)

class BookingController {

    /**
     * @route GET /api/bookings/availability
     * @desc (REFACTORED V1.9.6) Mengecek slot waktu yang tersedia
     * @access Terproteksi (Customer)
     */
    checkAvailability = asyncHandler(async (req, res) => {
        // PERBAIKAN KRITIS: Data 'GET' dibaca dari 'req.query', BUKAN 'req.body'
        const { packageId, startTime } = req.query; 

        if (!packageId || !startTime) {
            throw new ApiError(400, 'packageId dan startTime (format ISO) wajib ada di query parameter.');
        }
        
        // 1. Dapatkan detail paket (terutama room_id dan durasi)
        let pkg;
        try {
            // Kita panggil service V1.10 yang sudah kita buat
            pkg = await PackageService.getPackageById(packageId); 
        } catch (error) {
            if (error.statusCode === 404) {
                throw new ApiError(404, 'PackageID tidak ditemukan.');
            }
            throw error;
        }

        const { room_id, duration_in_minutes } = pkg;

        // 2. Hitung waktu selesai (end time)
        const startTimeObj = new Date(startTime);
        const endTimeObj = new Date(startTimeObj.getTime() + duration_in_minutes * 60000);

        // 3. Panggil service V1.8 (internal) untuk mengecek ketersediaan
        const isAvailable = await BookingService._checkSlotAvailability(
            room_id, 
            startTimeObj, 
            endTimeObj
        );

        if (!isAvailable) {
            // 409 Conflict (Bentrok)
            new apiResponse(res, 409, { isAvailable: false }, 'Slot waktu tidak tersedia (bentrok).');
        } else {
            // 200 OK (Tersedia)
            new apiResponse(res, 200, { isAvailable: true }, 'Slot waktu tersedia.');
        }
    });

    /**
     * @route POST /api/bookings
     * @desc Membuat booking baru
     * @access Terproteksi (Customer)
     */
    createBooking = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // (Perbaikan V1.9.4 - Mengembalikan 400 langsung)
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal.',
                errors: errors.array()
            });
        }

        const userId = req.user.user_id; // Dari authMiddleware V1.6
        const newBooking = await BookingService.createBooking(userId, req.body);
        
        new apiResponse(res, 201, newBooking, 'Booking berhasil dibuat (status PENDING).');
    });

    /**
     * @route GET /api/bookings/my-bookings
     * @desc Mendapatkan riwayat booking pengguna
     * @access Terproteksi (Customer)
     */
    getMyBookings = asyncHandler(async (req, res) => {
        const userId = req.user.user_id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        
        const result = await BookingService.getMyBookings(userId, page, limit);
        new apiResponse(res, 200, result, 'Riwayat booking berhasil diambil.');
    });

    /**
     * @route GET /api/bookings/:bookingId
     * @desc Mendapatkan detail satu booking
     * @access Terproteksi (Customer)
     */
    getBookingById = asyncHandler(async (req, res) => {
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