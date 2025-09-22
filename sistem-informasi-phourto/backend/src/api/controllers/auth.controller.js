const { validationResult } = require('express-validator');
const AuthService = require('../services/auth.service');
const apiError = require('../../utils/apiError');
const responseHandler = require('../../utils/responseHandler');
const asyncHandler = require('../../utils/asyncHandler');

class AuthController {
    // async register(req, res) {
    //     // Cek hasil validasi registrasi
    //     const errors = validationResult(req);
    //     if (!errors.isEmpty()) {
    //         throw new apiError('Validasi gagal.', 400, errors.array());
    //         // return res.status(400).json({ errors: errors.array() });
    //     }

    //     try {
    //         const newUser = await AuthService.registerUser(req.body);
    //         new responseHandler(res, 201, newUser, 'Registrasi berhasil. Silakan login.');
    //     } catch (error) {
    //         res.status(error.statusCode || 500).json({ message: error.message || 'Terjadi kesalahan pada server.' });
    //     }
    // }
    checkAvailability = asyncHandler(async (req, res) => {
        const { username, email } = req.query;
        if (!username && !email) {
            throw new apiError('username atau email adalah parameter yang wajib.', 400);
        }
        const isAvailable = await AuthService.checkAvailability(username, email);
        new responseHandler(res, 200, { isAvailable }, 'Pemeriksaan ketersediaan berhasil.');
    });


    // async login(req, res) {
    //     // Cek hasil validasi login
    //     const errors = validationResult(req);
    //     if (!errors.isEmpty()) {
    //         throw new apiError('Validasi gagal.', 400, errors.array());
    //     }

    //     try {
    //         const { token, user } = await AuthService.loginUser(req.body);
    //         new responseHandler(res, 200, { token, user }, 'Login berhasil.');
    //     } catch (error) {
    //         res.status(error.statusCode || 500).json({ message: error.message || 'Terjadi kesalahan pada server.' });
    //     }
    // }
    register = asyncHandler(async (req, res) => {
        // Cek hasil validasi registrasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError('Validasi gagal.', 400, errors.array());
        }
        const newUser = await AuthService.registerUser(req.body);
        new responseHandler(res, 201, newUser, 'Registrasi berhasil. Silakan login.');
    });

    login = asyncHandler(async (req, res) => {
        // Cek hasil validasi login
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError('Validasi gagal.', 400, errors.array());
        }
        const { token, user } = await AuthService.loginUser(req.body);
        new responseHandler(res, 200, { token, user }, 'Login berhasil.');
    });

    getProfile = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new apiError('User tidak ditemukan. Silakan login kembali.', 401);
        }
        const userProfile = await AuthService.getUserProfile(userId);
        new responseHandler(res, 200, userProfile, 'Profil user berhasil diambil.');
    });

    updateProfile = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new apiError('User tidak ditemukan. Silakan login kembali.', 401);
        }
        const updatedUser = await AuthService.updateUserProfile(userId, req.body);
        new responseHandler(res, 200, updatedUser, 'Profil user berhasil diperbarui.');
    });

    changePassword = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new apiError('User tidak ditemukan. Silakan login kembali.', 401);
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new apiError('currentPassword dan newPassword adalah parameter yang wajib.', 400);
        }
        await AuthService.changeUserPassword(userId, currentPassword, newPassword);
        new responseHandler(res, 200, null, 'Password berhasil diubah.');
    });

    logout = asyncHandler(async (req, res) => {
        // Untuk JWT, logout biasanya dilakukan di sisi client dengan menghapus token.
        // Namun, jika menggunakan token blacklist, implementasikan logika di sini.
        new responseHandler(res, 200, null, 'Logout berhasil.');
    });
}

module.exports = new AuthController();