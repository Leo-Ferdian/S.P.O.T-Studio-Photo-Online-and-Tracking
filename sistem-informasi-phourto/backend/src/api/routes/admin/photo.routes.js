const express = require('express');
const router = express.Router();
const AdminPhotoController = require('../../controllers/admin/photo.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const S3Service = require('../../services/s3.service');

// 2. Impor Validator V1.10
const {
    uploadPhotoValidationRules,
    bookingIdParamValidationRules
} = require('../../validator/admin/photo.validator');

// 3. Terapkan middleware keamanan untuk semua rute
router.use(authMiddleware, isAdmin);

// --- RUTE BARU DITAMBAHKAN DI SINI ---
/**
 * @route   GET /api/admin/photos/:bookingId
 * @desc    Mengambil galeri untuk satu booking (Admin)
 */
router.get(
    '/:bookingId',
    bookingIdParamValidationRules(), // Gunakan validator
    AdminPhotoController.getBookingGallery // Panggil controller baru
);
// ------------------------------------

// 4. Definisikan Rute Upload Foto (Kode Anda yang sudah ada)
// POST /api/admin/photos/upload/:bookingId
router.post(
    '/upload/:bookingId',

    // Langkah 1: VALIDASI
    uploadPhotoValidationRules(),

    // Langkah 2: UPLOAD KE S3
    S3Service.upload.array('photos', 100),

    // Langkah 3: SIMPAN KE DB
    AdminPhotoController.uploadBookingPhotos
);

// Rute untuk menghapus foto (jika diperlukan di masa depan)
// router.delete('/:photoId', ...);

module.exports = router;