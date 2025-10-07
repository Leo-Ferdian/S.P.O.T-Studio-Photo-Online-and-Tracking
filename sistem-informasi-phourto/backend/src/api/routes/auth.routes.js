const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const AuthController = require('../controllers/auth.controller');
const { registerValidationRules, loginValidationRules } = require('../validator/auth.validator');

// Rate Limiting untuk rute autentikasi
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10, // Batasi setiap IP hingga 10 percobaan login per 15 menit
    skipSuccessfulRequests: true, // Jangan hitung permintaan yang berhasil (status 2xx)
    message: 'Terlalu banyak percobaan login dari IP ini, silakan coba lagi setelah 15 menit.'
});

// Rute untuk registrasi pengguna baru
// POST /api/auth/register
router.post('/register', registerValidationRules(), AuthController.register);

// Rute untuk login pengguna
// POST /api/auth/login
router.post('/login', authLimiter, loginValidationRules(), AuthController.login);

module.exports = router;