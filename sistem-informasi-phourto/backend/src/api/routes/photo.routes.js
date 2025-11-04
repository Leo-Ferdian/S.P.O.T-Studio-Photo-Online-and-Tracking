const express = require('express');
const router = express.Router();
const PhotoController = require('../controllers/photo.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { getGalleryValidationRules } = require('../validator/photo.validator'); 

// 2. Terapkan Middleware Keamanan
// Semua rute di bawah ini dilindungi (hanya pelanggan yang login bisa akses)
router.use(authMiddleware);

/**
 * @route GET /api/photos/:bookingId/gallery
 * @desc Mendapatkan URL Pre-signed untuk semua file foto (Gallery View)
 */
router.get(
    '/:bookingId/gallery',
    getGalleryValidationRules(), 
    PhotoController.getBookingGallery 
);
/**
 * @route POST /api/photos/:bookingId/download
 * @desc BARU V1.13: Memicu proses pembuatan file .zip Galeri secara Asynchronous.
 * Memanggil PhotoService.triggerZipWorker.
 */
router.post(
    '/:bookingId/download',
    getGalleryValidationRules(), 
    PhotoController.triggerGalleryDownload 
);
/**
 * @route GET /api/photos/:bookingId/download-status
 * @desc BARU V1.13: Endpoint polling untuk memeriksa status file .zip dan mendapatkan link download.
 * Memanggil PhotoService.getDownloadStatus.
 */
router.get(
    '/:bookingId/download-status',
    getGalleryValidationRules(), 
    PhotoController.getDownloadStatus
);
// Rute POST /upload/... yang lama (penyebab error) telah dihapus dari file ini.
// Rute itu seharusnya ada di 'api/routes/admin/photo.routes.js'.

module.exports = router;