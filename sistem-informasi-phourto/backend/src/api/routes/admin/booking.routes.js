const express = require('express');
const router = express.Router();

// 1. Impor Kontroler
const AdminBookingController = require('../../controllers/admin/booking.controller');

// 2. Impor Middleware Keamanan
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');

// 3. Impor Validator
const {
    updateStatusValidationRules,
    bookingIdValidationRules,
    rescheduleValidationRules
} = require('../../validator/booking.validator');

// 4. Terapkan Middleware Keamanan
router.use(authMiddleware, isAdmin);

// 5. Definisikan Rute
// GET /api/admin/bookings/recent
router.get('/recent', AdminBookingController.getRecentBookings);
// ======================================

// Rute untuk mendapatkan semua data booking (dengan pagination)
// GET /api/admin/bookings
router.get('/', AdminBookingController.getAllBookings);

// Rute untuk mendapatkan detail SATU booking
// GET /api/admin/bookings/:id
router.get(
    '/:bookingId',
    bookingIdValidationRules(),
    AdminBookingController.getBookingDetailsByAdmin
);

// Rute untuk memperbarui status sebuah booking
// PUT /api/admin/bookings/:id/status
router.put(
    '/:bookingId/status',
    updateStatusValidationRules(),
    AdminBookingController.updateBookingStatus
);

// Rute untuk RESCHEDULE (Penjadwalan Ulang)
// PUT /api/admin/bookings/:id/reschedule
router.put(
    '/:bookingId/reschedule',
    rescheduleValidationRules(),
    AdminBookingController.rescheduleBooking
);

// DELETE /api/admin/bookings/:id
router.delete(
    '/:bookingId',
    bookingIdValidationRules(), // Kita gunakan validator yang sama untuk memastikan ID valid
    AdminBookingController.deleteBooking // Panggil fungsi controller baru
);
// ----------------------------------------------------

module.exports = router;