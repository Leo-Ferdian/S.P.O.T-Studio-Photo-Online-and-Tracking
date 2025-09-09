const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controllers');
const { registerValidationRules, loginValidationRules } = require('../validator/auth.validator');

// Rute untuk registrasi pengguna baru
// POST /api/auth/register
router.post('/register', registerValidationRules(), AuthController.register);

// Rute untuk login pengguna
// POST /api/auth/login
router.post('/login', loginValidationRules(), AuthController.login);

module.exports = router;