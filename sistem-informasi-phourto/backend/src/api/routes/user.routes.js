const express = require('express');
const router = express.Router();

// Impor komponen
const UserController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { updateProfileValidationRules, changePasswordValidationRules } = require('../validators/user.validator');

// Semua rute di bawah ini dilindungi dan memerlukan login
router.use(authMiddleware);

// Rute untuk mendapatkan profil pengguna yang sedang login
// GET /api/profile/me
router.get('/me', UserController.getMyProfile);

// Rute untuk memperbarui profil pengguna yang sedang login
// PUT /api/profile/me
router.put('/me', updateProfileValidationRules(), UserController.updateMyProfile);

// Rute untuk mengubah password
// PUT /api/profile/change-password
router.put('/change-password', changePasswordValidationRules(), UserController.changeMyPassword);

// Rute untuk menghapus akun
// DELETE /api/profile/me
router.delete('/me', UserController.deleteMyAccount);

module.exports = router;