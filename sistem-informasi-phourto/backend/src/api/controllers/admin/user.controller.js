const AdminUserService = require('../../services/admin/user.service.js');
const ApiResponse = require('../../../utils/apiResponse');
const asyncHandler = require('../../../utils/asyncHandler');
const { validationResult } = require('express-validator');
const ApiError = require('../../../utils/apiError');
const { logger } = require('../../../utils/logger');
const { USER_ROLES } = require('../../../config/constants'); // Impor konstanta peran

class AdminUserController {

    /**
     * @route GET /api/admin/users
     * @desc Mengambil daftar semua pengguna dengan paginasi.
     * @access Admin
     */
    getAllUsers = asyncHandler(async (req, res) => {
        // PENYESUAIAN 1: Ambil 'search' dari req.query
        const { page = 1, limit = 10, search } = req.query;
        // PENYESUAIAN 2: Perbarui log agar menyertakan 'search'
        logger.info(`Admin mengambil daftar pengguna: Page ${page}, Limit ${limit}, Search: ${search || 'None'}`);
        // PENYESUAIAN 3: Kirim 'options' sebagai objek ke service
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            search: search // Teruskan 'search' (bisa undefined jika tidak ada)
        };

        const result = await AdminUserService.getAllUsers(options);

        new ApiResponse(res, 200, result, 'Pengguna berhasil diambil.');
    });

    /**
     * @route GET /api/admin/users/:userId
     * @desc Mengambil detail satu pengguna.
     * @access Admin
     */
    getUserDetails = asyncHandler(async (req, res) => {
        // Validasi (Diasumsikan validator sudah berjalan di rute)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        const { userId } = req.params;
        logger.info(`Admin mengambil detail untuk pengguna: ${userId}`);

        // Panggil service V1.9
        const user = await AdminUserService.getUserDetails(userId);

        new ApiResponse(res, 200, user, 'Detail pengguna berhasil diambil.');
    });

    /**
     * @route PUT /api/admin/users/:userId/role
     * @desc Memperbarui peran (role) seorang pengguna.
     * @access Admin
     */
    updateUserRole = asyncHandler(async (req, res) => {
        // Validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        const { userId } = req.params;
        const { role } = req.body; // 'admin' atau 'customer'

        // Peran 'role' baru seharusnya sudah divalidasi oleh validator
        logger.warn(`Admin (req.user.user_id) mengubah peran untuk ${userId} menjadi ${role}`);
        // Panggil service V1.9
        const updatedUser = await AdminUserService.updateUserRole(userId, role);
        new ApiResponse(res, 200, updatedUser, 'Peran pengguna berhasil diperbarui.');
    });
    /**
     * @route PUT /api/admin/users/:userId/profile
     * @desc Memperbarui detail profil (nama, email, hp) seorang pengguna.
     * @access Admin
     */
    updateUserProfile = asyncHandler(async (req, res) => {
        // 1. Validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        // 2. Ambil data dari request
        const { userId } = req.params;
        const profileData = req.body; // { full_name, email, phone_number }

        logger.info(`Admin (${req.user.user_id}) memperbarui profil untuk ${userId}`);
        // 3. Panggil service (yang akan kita buat)
        const updatedUser = await AdminUserService.updateUserProfile(userId, profileData);
        // 4. Kirim respons
        new ApiResponse(res, 200, updatedUser, 'Profil pengguna berhasil diperbarui.');
    });

    /**
     * @route DELETE /api/admin/users/:userId
     * @desc Menghapus seorang pengguna.
     * @access Admin
     */
    deleteUser = asyncHandler(async (req, res) => {
        // Validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        const { userId } = req.params;
        logger.warn(`Admin (req.user.user_id) menghapus pengguna: ${userId}`);

        // Panggil service V1.9
        await AdminUserService.deleteUser(userId);

        new ApiResponse(res, 200, null, 'Pengguna berhasil dihapus.');
    });
}

module.exports = new AdminUserController();