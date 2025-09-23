const UserService = require('../services/user.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/responseHandler');
const { validationResult } = require('express-validator');

class UserController { // Implementasi operasi CRUD untuk pengguna yang terautentikasi
    // C: Change my own password
    changeMyPassword = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const { old_password, new_password } = req.body;
        await UserService.changeUserPassword(userId, old_password, new_password);
        new ApiResponse(res, 200, null, 'Password berhasil diubah.');
    });

    // R: Read my own profile
    getMyProfile = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const userProfile = await UserService.getUserProfileById(userId);
        new ApiResponse(res, 200, userProfile, 'Profil berhasil diambil.');
    });

    // U: Update my own profile
    updateMyProfile = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const updatedUser = await UserService.updateUserProfile(userId, req.body);
        new ApiResponse(res, 200, updatedUser, 'Profil berhasil diperbarui.');
    });

    // D: Delete my own account
    deleteMyAccount = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        await UserService.deleteUserAccount(userId);
        new ApiResponse(res, 200, null, 'Akun Anda telah berhasil dihapus.');
    });
}

module.exports = new UserController();