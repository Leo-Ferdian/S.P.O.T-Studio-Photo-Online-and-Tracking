const express = require('express');
const router = express.Router();
const PhotoController = require('../controllers/photo.controller');
// const authMiddleware = require('../middlewares/auth.middleware'); // <-- 1. HAPUS INI
const {
    claimPhotoValidationRules // <-- 2. IMPOR VALIDATOR BARU
} = require('../validator/photo.validator');

// 3. Hapus Middleware Keamanan Global
// router.use(authMiddleware); // <-- HAPUS INI

/**
 * @route GET /api/photos/gallery
 * @desc Mendapatkan URL Pre-signed (Publik, divalidasi oleh 'code' & 'email')
 */
router.get(
    '/gallery', // 4. Ubah path (tidak lagi memerlukan :bookingId)
    claimPhotoValidationRules(), // 5. Gunakan validator baru
    PhotoController.getBookingGallery
);

/**
 * @route POST /api/photos/download
 * @desc Memicu proses ZIP (Publik, divalidasi)
 */
router.post(
    '/download', // 4. Ubah path
    claimPhotoValidationRules(), // 5. Gunakan validator baru
    PhotoController.triggerGalleryDownload
);

/**
 * @route GET /api/photos/download-status
 * @desc Polling status ZIP (Publik, divalidasi)
 */
router.get(
    '/download-status', // 4. Ubah path
    claimPhotoValidationRules(), // 5. Gunakan validator baru
    PhotoController.getDownloadStatus
);

module.exports = router;