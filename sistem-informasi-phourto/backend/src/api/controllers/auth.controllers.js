const { validationResult } = require('express-validator');
const AuthService = require('../services/auth.services');

class AuthController {
    async register(req, res) {
        // Cek hasil validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newUser = await AuthService.registerUser(req.body);
            res.status(201).json({
                message: 'Registrasi berhasil! Silakan login.',
                user: newUser
            });
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message || 'Terjadi kesalahan pada server.' });
        }
    }

    async login(req, res) {
        // Cek hasil validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { token, user } = await AuthService.loginUser(req.body);
            res.status(200).json({
                message: 'Login berhasil!',
                token,
                user
            });
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message || 'Terjadi kesalahan pada server.' });
        }
    }
}

module.exports = new AuthController();