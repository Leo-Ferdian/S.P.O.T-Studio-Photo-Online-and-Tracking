const { validationResult } = require('express-validator');
const AuthService = require('../services/auth.service');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { logger } = require('../../utils/logger');

/**
 * Helper function untuk menangani error validasi
 * Mengambil pesan error pertama dari array
 */
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Ambil pesan error spesifik pertama dari validator
        const primaryError = errors.array()[0].msg || 'Validasi gagal.';

        // Lempar ApiError agar bisa ditangani oleh errorHandler
        // (Ini lebih baik daripada 'return res.status(400).json(...)')
        throw new ApiError(400, primaryError, errors.array());
    }
};

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
        // 1. Tangani error validasi (menggunakan helper baru)
        handleValidationErrors(req, res);

        const newUser = await AuthService.registerUser(req.body);

        // (Pesan sukses dari service sudah benar)
        new ApiResponse(res, 201, newUser, newUser.message || 'Registrasi berhasil.');
    });

    login = asyncHandler(async (req, res) => {
        // 1. Tangani error validasi
        handleValidationErrors(req, res);

        const { email, password } = req.body;
        const { token, user } = await AuthService.loginUser(email, password);

        res.setHeader('Authorization', `Bearer ${token}`);
        new ApiResponse(res, 200, { token, user }, 'Login berhasil.');
    });

    /**
     * @route POST /api/auth/verify-otp
     * @desc Memverifikasi OTP registrasi pengguna
     * @access Publik
     */
    verifyOtp = asyncHandler(async (req, res) => {
        // 1. Validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        // 2. Ambil data
        const { email, otp } = req.body;

        // 3. Panggil service (langkah terakhir kita)
        // Service ini akan memvalidasi OTP di DB & mengubah is_verified = true
        await AuthService.verifyUserOtp(email, otp);

        // 4. Kirim respons
        new ApiResponse(res, 200, null, 'Verifikasi email berhasil. Akun Anda sekarang aktif.');
    });

    /**
     * @route POST /api/auth/forgot-password
     * @desc Memulai alur lupa password.
     * @access Publik
     */
    forgotPassword = asyncHandler(async (req, res) => {
        // 1. Tangani error validasi
        handleValidationErrors(req, res);

        const { email } = req.body;

        // (Validator [cite: `api/validator/auth.validator.js`] sudah melempar error 404 jika tidak ditemukan)
        logger.info(`Memulai reset password untuk ${email} (User ID: ${req.foundUserId})`);
        await AuthService.handleForgotPasswordRequest(req.foundUserId, email);

        new ApiResponse(res, 200, null, 'Tautan reset password telah dikirim ke email Anda.');
    });

    /**
    * @route POST /api/auth/reset-password
    * @desc Menyelesaikan alur lupa password.
    * @access Publik
    */
    resetPassword = asyncHandler(async (req, res) => {
        // 1. Tangani error validasi
        handleValidationErrors(req, res);

        // 2. Ambil data dari body
        const { token, newPassword } = req.body;

        // 3. Panggil service
        await AuthService.resetPassword(token, newPassword);

        // 4. Kirim respons sukses
        new ApiResponse(res, 200, null, 'Password Anda telah berhasil direset.');
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