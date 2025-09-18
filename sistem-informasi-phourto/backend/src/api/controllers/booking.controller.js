const BookingService = require('../services/booking.service');
const asyncHandler = require('../../utils/asyncHandler');
const { validationResult } = require('express-validator');

class BookingController {
    // Menggunakan asyncHandler untuk menangani error secara otomatis
    checkAvailability = asyncHandler(async (req, res, next) => {
        const { branch_id, date } = req.query;

        if (!branch_id ||!date) {
            return res.status(400).json({ message: 'Parameter branch_id dan date wajib diisi.' });
        }

        // Menerapkan saran: Parse input string ke integer
        const branchId = parseInt(branch_id, 10);
        if (isNaN(branchId)) {
            return res.status(400).json({ message: 'branch_id harus berupa angka.' });
        }

        const availableSlots = await BookingService.checkAvailability(branchId, date);
        // Menerapkan saran: Gunakan return untuk konsistensi
        return res.status(200).json(availableSlots);
    });

    create = asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const result = await BookingService.createBooking(userId, req.body);

        return res.status(201).json({
            message: 'Booking berhasil dibuat. Silakan selesaikan pembayaran.',
            data: result
        });
    });

    getMyBookings = asyncHandler(async (req, res, next) => {
        // Menerapkan saran: Mendukung pagination dari query
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;

        const bookings = await BookingService.getMyBookings(
            userId,
            parseInt(page, 10),
            parseInt(limit, 10)
        );
        return res.status(200).json(bookings);
    });

    getBookingById = asyncHandler(async (req, res, next) => {
        const userId = req.user.id;
        const { id } = req.params;

        const bookingId = parseInt(id, 10);
        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'ID Booking harus berupa angka.' });
        }

        const booking = await BookingService.getBookingById(bookingId, userId);
        return res.status(200).json(booking);
    });
}

module.exports = new BookingController();