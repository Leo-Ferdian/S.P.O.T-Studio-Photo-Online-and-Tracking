const AdminUserService = require('../../services/admin/user.service.js'); 
const ApiResponse = require('../../../utils/apiResponse');
const asyncHandler = require('../../../utils/asyncHandler');

class AdminUserController {

    /**
     * Mengambil daftar semua pengguna dengan paginasi.
     */
    getAllUsers = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10 } = req.query; // Ambil paginasi dari query
        const result = await AdminUserService.getAllUsers(parseInt(page), parseInt(limit));
        new ApiResponse(res, 200, result, 'Pengguna berhasil diambil.');
    });

    // --- Fungsi Controller Admin Lainnya Terkait User (Contoh) ---
    // getUserById = asyncHandler(async (req, res) => {
    //     const userId = req.params.id;
    //     const user = await UserService.getUserProfileById(userId); // Panggil service yg sesuai
    //     new ApiResponse(res, 200, user, 'Detail pengguna berhasil diambil.');
    // });
    
    // deleteUser = asyncHandler(async (req, res) => {
    //     const userId = req.params.id;
    //     await UserService.deleteUserAccount(userId); // Panggil service yg sesuai
    //     new ApiResponse(res, 200, null, 'Pengguna berhasil dihapus.');
    // });

}

module.exports = new AdminUserController();