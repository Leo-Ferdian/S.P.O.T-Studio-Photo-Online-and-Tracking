const express = require('express');
const router = express.Router();
const PhotoController = require('../controllers/photo.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Terapkan middleware keamanan ke semua rute foto
router.use(authMiddleware);

// GET /api/photos
router.get('/', PhotoController.getMyPhotos);

// Anda bisa tambahkan rute lain di sini nanti
// GET /api/photos/:id
// DELETE /api/photos/:id

module.exports = router;