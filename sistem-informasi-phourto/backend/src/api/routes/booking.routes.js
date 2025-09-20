const express = require('express');
const router = express.Router();

// Impor komponen yang dibutuhkan
const BookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { createBookingValidationRules } = require('../validators/booking.validator');


// ==================================================
// RUTE UNTUK PENGGUNA (CUSTOMER)
// Semua rute di bawah ini dilindungi dan memerlukan login
// ==================================================

router.get('/availability', BookingController.checkAvailability);
router.post('/', createBookingValidationRules(), BookingController.create);
router.get('/my-bookings', BookingController.getMyBookings);
router.get('/:id', BookingController.getBookingById);

/**
 * @route   GET /api/bookings/availability
 * @desc    Mengecek slot waktu yang tersedia di cabang dan tanggal tertentu
 * @access  Private (Customer)
 * @query   branch_id, date (format: YYYY-MM-DD)
 */
router.get(
    '/availability',
    authMiddleware,
    BookingController.checkAvailability
);

/**
 * @route   POST /api/bookings
 * @desc    Membuat booking baru oleh pengguna yang sedang login
 * @access  Private (Customer)
 * @body    package_id, branch_id, booking_time
 */
router.post(
    '/',
    authMiddleware,
    createBookingValidationRules(),
    BookingController.create
);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Mendapatkan riwayat booking milik pengguna yang sedang login
 * @access  Private (Customer)
 */
router.get(
    '/my-bookings',
    authMiddleware,
    BookingController.getMyBookings
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Mendapatkan detail satu booking spesifik milik pengguna
 * @access  Private (Customer)
 */
router.get(
    '/:id',
    authMiddleware,
    BookingController.getBookingById
);


module.exports = router;