const express = require('express');
const router = express.Router();

// 1. Impor Kontroler
const AdminBookingController = require('../../controllers/admin/booking.controller');

// 2. Impor Middleware Keamanan
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');

// 3. Impor Validator V1.9 (dari file Canvas)
//    Kita sekarang mengimpor TIGA aturan yang relevan
const { 
    updateStatusValidationRules,
    bookingIdValidationRules,
    rescheduleValidationRules // <-- Tambahan baru
} = require('../../validator/booking.validator');

// 4. Terapkan Middleware Keamanan
//    Semua rute di bawah ini dilindungi (hanya Admin yang bisa akses)
router.use(authMiddleware, isAdmin);

// 5. Definisikan Rute

// Rute untuk mendapatkan semua data booking (dengan pagination)
// GET /api/admin/bookings
router.get('/', AdminBookingController.getAllBookings);

// Rute untuk mendapatkan detail SATU booking
// GET /api/admin/bookings/:id
router.get(
    '/:bookingId', 
    bookingIdValidationRules(), // Validasi bahwa :id adalah UUID
    AdminBookingController.getBookingDetailsByAdmin
);

// Rute untuk memperbarui status sebuah booking
// PUT /api/admin/bookings/:id/status
router.put(
    '/:bookingId/status', 
    updateStatusValidationRules(), // Validasi :id dan body { status: "..." }
    AdminBookingController.updateBookingStatus
);

// Rute untuk RESCHEDULE (Penjadwalan Ulang)
// PUT /api/admin/bookings/:id/reschedule
router.put(
    '/:bookingId/reschedule', 
    rescheduleValidationRules(), // Validasi :id dan body { new_start_time, new_room_id, reason }
    AdminBookingController.rescheduleBooking
);

module.exports = router;