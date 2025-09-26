const express = require('express');
const router = express.Router();
const multer = require('multer');

// Konfigurasi Multer untuk menyimpan file sementara di server
const upload = multer({ dest: 'uploads/' });

// Impor komponen
const AdminPhotoController = require('../../controllers/admin/photo.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');

// Terapkan middleware keamanan
router.use(authMiddleware, isAdmin);

// Rute untuk mengunggah satu foto untuk booking tertentu
// POST /api/admin/photos/booking/:bookingId
router.post(
    '/booking/:bookingId',
    upload.single('photo'), // 'photo' adalah nama field di form-data
    AdminPhotoController.uploadPhoto
);

module.exports = router;