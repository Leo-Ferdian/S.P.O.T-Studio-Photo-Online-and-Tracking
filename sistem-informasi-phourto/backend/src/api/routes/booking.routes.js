// src/api/routes/booking.routes.js
const express = require('express');
const router = express.Router();

// 1. Impor semua komponen
const BookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // Pastikan path ke folder middleware
const BookingValidator = require('../validator/booking.validator'); // Impor validator

// ==================================================
// RUTE UNTUK PENGGUNA (CUSTOMER)
// ==================================================

// 2. Terapkan authMiddleware ke SEMUA rute di bawah ini
// Ini adalah "penjaga" untuk semua endpoint booking
router.use(authMiddleware);

/**
 * @route   GET /api/bookings/availability
 * @desc    Mengecek slot waktu yang tersedia
 */
router.get(
    '/availability',
    BookingController.checkAvailability 
);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Mendapatkan riwayat booking pengguna
 */
router.get(
    '/my-bookings',
    BookingController.getMyBookings // Ini ada di controller Anda
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Mendapatkan detail satu booking
 */
router.get(
    '/:id',
    BookingController.getBookingById // Ini ada di controller Anda
);

/**
 * @route   POST /api/bookings
 * @desc    Membuat booking baru
 */
router.post(
    '/',
    BookingValidator.createBookingValidationRules(), // 3. Terapkan validator
    BookingController.create // 4. Jalankan controller
);

module.exports = router;