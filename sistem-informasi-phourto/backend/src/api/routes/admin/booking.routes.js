const express = require('express');
const router = express.Router();

// Impor komponen
const AdminBookingController = require('../../controllers/admin/booking.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const { updateStatusValidationRules } = require('../../validator/booking.validator');

// Terapkan middleware keamanan untuk semua rute di file ini
router.use(authMiddleware, isAdmin);

// Rute untuk mendapatkan semua data booking (dengan pagination)
// GET /api/admin/bookings
router.get('/', AdminBookingController.getAllBookings);

// Rute untuk memperbarui status sebuah booking
// PUT /api/admin/bookings/:id/status
router.put('/:id/status', updateStatusValidationRules(), AdminBookingController.updateBookingStatus);

module.exports = router;