const { param } = require('express-validator');
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');

/**
 * Aturan validasi untuk [R]ead (Membaca) Galeri
 * (Dipanggil oleh GET /api/photos/:bookingId/gallery)
 */
const getGalleryValidationRules = () => {
    return [
        param('bookingId')
            .isUUID().withMessage('ID Pesanan (Booking ID) harus berupa UUID yang valid.')
            
            // Catatan: Kita tidak perlu memeriksa kepemilikan (ownership) di sini.
            // Service (PhotoService.getPhotosByBooking) sudah melakukannya dengan
            // query "WHERE booking_id = $1 AND user_id = $2".
            // Validator hanya fokus pada format data.
    ];
};

module.exports = {
    getGalleryValidationRules
};