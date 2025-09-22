const BookingService = require('../services/booking.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiError = require('../../utils/apiError');
const { validationResult } = require('express-validator');
const responseHandler = require('../../utils/responseHandler');

class BookingController {
    /**
     * Menggunakan asyncHandler untuk menangani error secara otomatis
     * 
     * Mengecek ketersediaan slot pada cabang dan tanggal tertentu
     * Endpoint: GET /api/bookings/availability?branch_id=1&date=2023-09-01
     */ 

    checkAvailability = asyncHandler(async (req, res) => {
        const { branch_id, date } = req.query;

        if (!branch_id ||!date) {
            throw new apiError('branch_id dan date adalah parameter yang wajib.', 400);
        }

        // Parse input string ke integer
        const branch_Id = parseInt(branch_id, 10);
        if (isNaN(branch_Id)) {
            throw new apiError('branch_id harus berupa angka.', 400);
        }

        const availableSlots = await BookingService.checkAvailability(branch_Id, date);

        new responseHandler(res, 200, availableSlots, 'Ketersediaan slot berhasil diambil.');
    });
        // Membuat booking baru
    create = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError('Validasi gagal.', 400, errors.array());
        }

        const userId = req.user?.id;
        if (!userId) {
            throw new apiError('User tidak ditemukan. Silakan login kembali.', 401);
        }

        const result = await BookingService.createBooking(userId, req.body);

        new responseHandler(res, 201, result, 'Booking berhasil dibuat.');
    });

        // Mendapatkan daftar booking user saat ini
    getMyBookings = asyncHandler(async (req, res) => {
        // Pagination dari query
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;

        if (!userId) {
            throw new apiError('User tidak ditemukan. Silakan login kembali.', 401);
        }

        const bookings = await BookingService.getMyBookings(
            userId,
            parseInt(page, 10),
            parseInt(limit, 10)
        );
        new responseHandler(res, 200, bookings, 'Daftar booking berhasil diambil.');
    });
        // Mendapatkan detail booking user berdasarkan ID
    getBookingById = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;
        const bookingId = parseInt(id, 10);

        if (!userId) {
            throw new apiError('User tidak ditemukan. Silakan login kembali.', 401);
        }

        if (isNaN(bookingId)) {
            throw new apiError('ID booking harus berupa angka.', 400);
        }

        const booking = await BookingService.getBookingById(bookingId, userId);
        new responseHandler(res, 200, booking, 'Detail booking berhasil diambil.');
    });
}

module.exports = new BookingController();