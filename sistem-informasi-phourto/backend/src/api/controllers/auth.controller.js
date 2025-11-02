const { validationResult } = require('express-validator');
const AuthService = require('../services/auth.service');
const ApiError = require('../../utils/apiError'); // Pastikan 'A' besar jika nama kelasnya ApiError
const ApiResponse = require('../../utils/apiResponse'); // Pastikan 'A' besar
const asyncHandler = require('../../utils/asyncHandler');

class AuthController {

    // (Fungsi checkAvailability Anda sudah bagus, biarkan saja)
    checkAvailability = asyncHandler(async (req, res) => {
        const { username, email } = req.query;
        if (!username && !email) {
            // Urutan benar: statusCode, message
            throw new ApiError(400, 'username atau email adalah parameter yang wajib.'); 
        }
        const isAvailable = await AuthService.checkAvailability(username, email);
        new ApiResponse(res, 200, { isAvailable }, 'Pemeriksaan ketersediaan berhasil.');
    });

    register = asyncHandler(async (req, res) => {
        // 1. Tangani error validasi (dari auth.validator.js)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // FIX: Mengembalikan respons error secara langsung (Status 400).
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal.',
                errors: errors.array()
            });
        }

        const newUser = await AuthService.registerUser(req.body);

        // Hapus detail sensitif sebelum respons
        delete newUser.role;
        
        new ApiResponse(res, 201, newUser, 'Registrasi berhasil.');
    });

    login = asyncHandler(async (req, res) => {
        // 1. Tangani error validasi (untuk email/password kosong)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
             // FIX: Mengembalikan respons error secara langsung (Status 400).
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal.',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        
        const { token, user } = await AuthService.loginUser(email, password);

        // Pasang token di header dan kirim respons
        res.setHeader('Authorization', `Bearer ${token}`);
        
        new ApiResponse(res, 200, { token, user }, 'Login berhasil.');
    });

    getProfile = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new ApiError(401, 'User tidak ditemukan. Silakan login kembali.');
        }
        const userProfile = await AuthService.getUserProfile(userId);
        new ApiResponse(res, 200, userProfile, 'Profil user berhasil diambil.');
    });

    updateProfile = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new ApiError(401, 'User tidak ditemukan. Silakan login kembali.');
        }
        const updatedUser = await AuthService.updateUserProfile(userId, req.body);
        new ApiResponse(res, 200, updatedUser, 'Profil user berhasil diperbarui.');
    });

    changePassword = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new ApiError(401, 'User tidak ditemukan. Silakan login kembali.');
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new ApiError(400, 'currentPassword dan newPassword adalah parameter yang wajib.');
        }
        await AuthService.changeUserPassword(userId, currentPassword, newPassword);
        new ApiResponse(res, 200, null, 'Password berhasil diubah.');
    });

    logout = asyncHandler(async (req, res) => {
        // Implementasi logout sisi server (blacklist token) bisa ditambahkan di AuthService jika perlu.
        new ApiResponse(res, 200, null, 'Logout berhasil.');
    });
}

module.exports = new AuthController();