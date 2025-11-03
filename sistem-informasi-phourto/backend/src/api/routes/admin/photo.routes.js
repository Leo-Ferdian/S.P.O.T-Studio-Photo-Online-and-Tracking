const express = require('express');
const router = express.Router();
const AdminPhotoController = require('../../controllers/admin/photo.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const S3Service = require('../../services/s3.service');

// 2. Impor Validator V1.10 (dari file di Canvas Anda, diperbaiki)
const {
    uploadPhotoValidationRules,
    bookingIdParamValidationRules // 1. KITA ASUMSIKAN KITA AKAN BUAT INI
} = require('../../validator/admin/photo.validator');

// 3. Terapkan middleware keamanan untuk semua rute
router.use(authMiddleware, isAdmin);

// 4. Definisikan Rute Upload Foto
// Rute ini sekarang memiliki rantai 4-langkah:
// POST /api/admin/photos/upload/:bookingId
router.post(
    '/upload/:bookingId',

    // Langkah 1: VALIDASI DULU (V1.10)
    // Cek UUID, cek status pesanan (PAID-DP/PAID-FULL)
    // (Fungsi 'uploadPhotoValidationRules' diekspor dari file Canvas)
    uploadPhotoValidationRules(),

    // Langkah 2: JIKA VALID, UPLOAD KE S3
    // (Middleware 'upload' dari s3.service.js V1.10 di Canvas)
    S3Service.upload.array('photos', 100), // Batas 100 file

    // Langkah 3: JIKA S3 BERHASIL, SIMPAN KE DB
    // (Memanggil fungsi 'uploadPhotos' dari controller V1.10)
    AdminPhotoController.uploadBookingPhotos
);

// Rute untuk menghapus foto (jika diperlukan di masa depan)
// router.delete('/:photoId', ...);

module.exports = router;