const express = require('express');
const router = express.Router();
const AdminPhotoController = require('../../controllers/admin/photo.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const S3Service = require('../../services/s3.service'); // <-- Impor S3Service di sini

// Lindungi semua rute
router.use(authMiddleware, isAdmin);

// Rute untuk mengunggah foto
// Alur: auth -> isAdmin -> S3Service.upload -> AdminPhotoController.uploadPhotos
router.post(
    '/upload/:bookingId',
    S3Service.upload.array('photos', 100), // Middleware untuk upload file
    AdminPhotoController.uploadPhotos      // Controller untuk menyimpan ke DB
);

module.exports = router;