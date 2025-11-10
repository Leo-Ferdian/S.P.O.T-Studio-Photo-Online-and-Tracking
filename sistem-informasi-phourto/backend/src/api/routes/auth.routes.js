const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const AuthController = require('../controllers/auth.controller');
// Impor validator (sudah benar)
const {
    registerValidationRules,
    loginValidationRules,
    forgotPasswordValidationRules,
    resetPasswordValidationRules
} = require('../validator/auth.validator');

// Rate Limiting (tidak berubah)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    message: 'Terlalu banyak percobaan login dari IP ini, silakan coba lagi setelah 15 menit.'
});

// Rute untuk registrasi pengguna baru
// POST /api/auth/register
// --- PERBAIKAN: '/Register' diubah menjadi '/register' ---
router.post('/register', registerValidationRules(), AuthController.register);

// Rute untuk login pengguna
// POST /api/auth/login
router.post('/login', authLimiter, loginValidationRules(), AuthController.login);

// Rute untuk meminta reset password (sudah benar)
// POST /api/auth/forgot-password
router.post(
    '/forgot-password',
    forgotPasswordValidationRules(),
    AuthController.forgotPassword
);

// Rute untuk MENJALANKAN reset password
// POST /api/auth/reset-password
router.post(
    '/reset-password',
    resetPasswordValidationRules(), // Terapkan validator baru
    AuthController.resetPassword // Panggil controller baru
);

module.exports = router;