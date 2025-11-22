const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');
// 1. Impor validator (kita akan tambahkan aturan baru nanti)
const BookingValidator = require('../validator/booking.validator');

// ==================================================
// RUTE UNTUK PENGGUNA (CUSTOMER)
// ==================================================

// 2. Terapkan authMiddleware ke SEMUA rute di bawah ini
router.use(authMiddleware);

/**
 * @route   GET /api/bookings/availability
 * @desc    Mengecek slot waktu yang tersedia
 */
router.get(
    '/availability',
    // 3. Terapkan validator baru (yang akan kita buat)
    BookingValidator.availabilityValidationRules(),
    BookingController.checkAvailability
);

/**
 * @route   GET /api/bookings/my-bookings
 */
router.get(
    '/my-bookings',
    BookingController.getMyBookings
);
router.get(
    '/my-history',
    BookingController.getMyBookings
);

/**
 * @route   GET /api/bookings/:id
 */
router.get(
    '/:bookingId',
    BookingController.getBookingById
);

/**
 * @route   POST /api/bookings
 */
router.post(
    '/',
    BookingValidator.createBookingValidationRules(),
    BookingController.createBooking
);

module.exports = router;