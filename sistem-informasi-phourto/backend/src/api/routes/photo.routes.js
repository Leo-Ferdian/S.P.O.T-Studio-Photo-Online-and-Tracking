const express = require('express');
const router = express.Router();
const AdminPhotoController = require('../controllers/admin/photo.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/admin.middleware');

// Lindungi semua rute dengan middleware otentikasi dan otorisasi admin
router.use(authMiddleware, isAdmin);

// Rute untuk mengunggah foto ke booking tertentu
// Method: POST, URL: /api/admin/photos/upload/:bookingId
router.post('/upload/:bookingId', AdminPhotoController.uploadPhotos);

module.exports = router;