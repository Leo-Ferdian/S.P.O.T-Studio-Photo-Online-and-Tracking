const express = require('express');
const router = express.Router();
const PhotoController = require('../controllers/photo.controller');
const { claimPhotoValidationRules } = require('../validator/photo.validator');

// =================================================================
// ROUTE PUBLIK (DENGAN VALIDASI CLAIM)
// =================================================================

/**
 * @route   GET /api/photos/:bookingId/gallery?email=...
 * @desc    Mengambil daftar foto (JSON) untuk ditampilkan di halaman klaim.
 * @access  Public (Verified by Code & Email)
 */
router.get(
    '/:bookingId/gallery',
    claimPhotoValidationRules(), // Middleware validasi kita
    PhotoController.getBookingGallery
);

/**
 * @route   GET /api/photos/:bookingId/download-zip?email=...
 * @desc    Memicu download langsung file ZIP (Streaming).
 * @access  Public (Verified by Code & Email)
 */
router.get(
    '/:bookingId/download-zip',
    claimPhotoValidationRules(), // Middleware validasi kita
    PhotoController.downloadGalleryZip
);

/**
 * @route   GET /api/photos/:bookingId/download-single?email=...&url=...
 * @desc    Memicu download satu foto (Proxy agar tidak kena CORS).
 * @access  Public
 */
router.get(
    '/:bookingId/download-single',
    claimPhotoValidationRules(),
    PhotoController.downloadSinglePhoto
);

module.exports = router;