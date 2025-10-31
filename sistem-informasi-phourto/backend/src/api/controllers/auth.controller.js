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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // === PERBAIKAN DI SINI ===
            // Urutan benar: statusCode, message, errors array
            throw new ApiError(400, 'Validasi gagal.', errors.array()); 
            // =========================
        }
        const newUser = await AuthService.registerUser(req.body);
        new ApiResponse(res, 201, newUser, 'Registrasi berhasil. Silakan login.');
    });

    login = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
             // === PERBAIKAN DI SINI ===
            // Urutan benar: statusCode, message, errors array
            throw new ApiError(400, 'Validasi gagal.', errors.array());
             // =========================
        }
        const { token, user } = await AuthService.loginUser(req.body.email, req.body.password); // Ambil email & pass langsung
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