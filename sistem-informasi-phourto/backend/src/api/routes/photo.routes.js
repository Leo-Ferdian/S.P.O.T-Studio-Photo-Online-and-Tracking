const express = require('express');
const router = express.Router();
const PhotoController = require('../controllers/photo.controller');
// const authMiddleware = require('../middlewares/auth.middleware'); // <-- 1. HAPUS INI
const {
    claimPhotoValidationRules // <-- 2. IMPOR VALIDATOR BARU
} = require('../validator/photo.validator');

// 3. HAPUS Middleware Keamanan Global
// router.use(authMiddleware); 

/**
 * @route GET /api/photos/gallery?code=...&email=...
 * @desc Mendapatkan URL Pre-signed (Publik, divalidasi)
 */
router.get(
    '/gallery', // 4. Ubah path
    claimPhotoValidationRules(), // 5. Gunakan validator baru
    PhotoController.getBookingGallery
);

/**
 * @route POST /api/photos/download?code=...&email=...
 * @desc Memicu proses ZIP (Publik, divalidasi)
 */
router.post(
    '/download', // 4. Ubah path
    claimPhotoValidationRules(), // 5. Gunakan validator baru
    PhotoController.triggerGalleryDownload
);

/**
 * @route GET /api/photos/download-status?code=...&email=...
 * @desc Polling status ZIP (Publik, divalidasi)
 */
router.get(
    '/download-status', // 4. Ubah path
    claimPhotoValidationRules(), // 5. Gunakan validator baru
    PhotoController.getDownloadStatus
);

module.exports = router;