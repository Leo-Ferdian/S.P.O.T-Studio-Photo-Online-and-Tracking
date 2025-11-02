const UserService = require('../services/user.service'); // Service V1.9
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');
const apiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');

class UserController {

    /**
     * @route POST /api/users/me/change-password
     * @desc Mengubah password pengguna yang sedang login
     * @access Private (Customer)
     */
    changeMyPassword = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Menggunakan ApiError agar ditangkap oleh asyncHandler
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        // PERUBAHAN V1.9: Menggunakan user_id dari token JWT
        const userId = req.user.user_id; 
        const { currentPassword, newPassword } = req.body;
        
        // Memanggil service V1.9 (nama fungsi sudah benar)
        await UserService.changeUserPassword(userId, currentPassword, newPassword);
        
        new apiResponse(res, 200, null, 'Password berhasil diubah.');
    });

    /**
     * @route GET /api/users/me
     * @desc Membaca profil pengguna yang sedang login
     * @access Private (Customer)
     */
    getMyProfile = asyncHandler(async (req, res) => {
        // PERUBAHAN V1.9: Menggunakan user_id dari token JWT
        const userId = req.user.user_id; 
        
        // PERUBAHAN V1.9: Menyelaraskan nama fungsi (getUserProfileById -> getUserProfile)
        const userProfile = await UserService.getUserProfile(userId);
        
        new apiResponse(res, 200, userProfile, 'Profil berhasil diambil.');
    });

    /**
     * @route PUT /api/users/me
     * @desc Memperbarui profil pengguna yang sedang login
     * @access Private (Customer)
     */
    updateMyProfile = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        // PERUBAHAN V1.9: Menggunakan user_id dari token JWT
        const userId = req.user.user_id; 
        
        // Service V1.9 kita (UserService.updateUserProfile) sudah siap menerima req.body
        const updatedUser = await UserService.updateUserProfile(userId, req.body);
        
        new apiResponse(res, 200, updatedUser, 'Profil berhasil diperbarui.');
    });

    /**
     * @route DELETE /api/users/me
     * @desc Menghapus akun pengguna yang sedang login
     * @access Private (Customer)
     */
    deleteMyAccount = asyncHandler(async (req, res) => {
        // PERUBAHAN V1.9: Menggunakan user_id dari token JWT
        const userId = req.user.user_id; 
        
        // Memanggil service V1.9 (nama fungsi sudah benar)
        await UserService.deleteUserAccount(userId);
        
        new apiResponse(res, 200, null, 'Akun Anda telah berhasil dihapus.');
    });
}

module.exports = new UserController();