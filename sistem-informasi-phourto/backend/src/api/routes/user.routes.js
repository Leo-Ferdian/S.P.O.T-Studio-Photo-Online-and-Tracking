// src/api/routes/user.routes.js
const express = require('express');
const router = express.Router();

// 1. IMPOR SEMUA BAGIAN
// ==========================================================
// Ini adalah baris yang hilang/salah di file Anda:
const userController = require('../controllers/user.controller'); 

// Impor middleware dan validator yang sudah kita buat
const authMiddleware = require('../middlewares/auth.middleware');
const UserValidator = require('../validator/user.validator'); 
// ==========================================================


// 2. GUNAKAN MIDDLEWARE AUTENTIKASI
// Ini akan melindungi SEMUA rute di bawah ini.
// Tidak ada yang bisa mengakses /profile atau /password tanpa token.
router.use(authMiddleware);


// 3. DEFINISIKAN RUTE

// Rute untuk [R]ead Profil: GET /api/users/profile
router.get(
    '/profile', 
    userController.getMyProfile // <-- Perbaikan dari getUserProfile
);

// Rute untuk [U]pdate Profil: PUT /api/users/profile
router.put(
    '/profile',
    UserValidator.updateProfileValidationRules(), // Jalankan validasi
    userController.updateMyProfile                // Baru jalankan controller
);

// Rute untuk [C]hange Password: PATCH /api/users/password
router.patch(
    '/password',
    UserValidator.changePasswordValidationRules(), // Jalankan validasi
    userController.changeMyPassword                // Baru jalankan controller
);

// Rute untuk [D]elete Akun: DELETE /api/users/profile
router.delete(
    '/profile', 
    userController.deleteMyAccount
);

module.exports = router;