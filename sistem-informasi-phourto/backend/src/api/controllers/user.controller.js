const UserService = require('../services/user.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');
const { validationResult } = require('express-validator');
const apiError = require('../../utils/apiError');

class UserController {
    // C: Change my own password
    changeMyPassword = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        
        // Anda bisa tambahkan validasi ini (walaupun validator sudah mengecek)
        if (!oldPassword || !newPassword) {
            throw new apiError(400, 'Password lama dan baru diperlukan.');
        }

        await UserService.changeUserPassword(userId, oldPassword, newPassword);
        new apiResponse (res, 200, null, 'Password berhasil diubah.');
    });

    // R: Read my own profile
    getMyProfile = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const userProfile = await UserService.getUserProfileById(userId);
        new apiResponse (res, 200, userProfile, 'Profil berhasil diambil.');
    });

    // U: Update my own profile
    updateMyProfile = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const userId = req.user.id;
        // req.body sekarang sudah camelCase: { fullName: "...", whatsappNumber: "..." }
        // Langsung kirim ke service
        const updatedUser = await UserService.updateUserProfile(userId, req.body);
        new apiResponse (res, 200, updatedUser, 'Profil berhasil diperbarui.');
    });

    // D: Delete my own account
    deleteMyAccount = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        await UserService.deleteUserAccount(userId);
        new apiResponse (res, 200, null, 'Akun Anda telah berhasil dihapus.');
    });
}

module.exports = new UserController();