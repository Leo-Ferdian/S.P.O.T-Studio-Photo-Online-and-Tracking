const express = require('express');
const router = express.Router();

// 1. Impor Kontroler V1.9 (dari Langkah 8e)
const AdminUserController = require('../../controllers/admin/user.controller');

// 2. Impor Middleware Keamanan
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');

// 3. Impor Validator V1.9 (dari file di Canvas Anda, Langkah 10g)
const {
    userIdParamValidationRules,
    updateUserRoleValidationRules,
    updateUserProfileValidationRules
} = require('../../validator/admin/user.validator.js');

// 4. Terapkan Middleware Keamanan
//    Semua rute di bawah ini dilindungi (hanya Admin yang bisa akses)
router.use(authMiddleware, isAdmin);

// 5. Definisikan Rute C-R-U-D Penuh
// GET /api/admin/users
// (Mendapatkan daftar semua pengguna)
router.get(
    '/',
    AdminUserController.getAllUsers
);
// GET /api/admin/users/:id
// (Mendapatkan detail satu pengguna)
router.get(
    '/:userId',
    userIdParamValidationRules(), // Validasi :id adalah UUID
    AdminUserController.getUserDetails // Panggil fungsi yang benar
);
// PUT /api/admin/users/:id/role
// (Memperbarui peran [role] seorang pengguna)
router.put(
    '/:userId/role',
    updateUserRoleValidationRules(), // Validasi :id (UUID) dan body { role: "..." }
    AdminUserController.updateUserRole // Panggil fungsi yang benar
);
// PUT /api/admin/users/:userId/profile
// (Memperbarui detail profil seorang pengguna)
router.put(
    '/:userId/profile',
    updateUserProfileValidationRules(), // Validasi :id, body { full_name, email, phone_number }
    AdminUserController.updateUserProfile // Panggil fungsi controller baru
);
// DELETE /api/admin/users/:id
// (Menghapus seorang pengguna)
router.delete(
    '/:userId',
    userIdParamValidationRules(), // Validasi :id adalah UUID
    AdminUserController.deleteUser // Panggil fungsi yang benar
);

module.exports = router;
