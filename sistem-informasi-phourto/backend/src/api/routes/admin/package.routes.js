const express = require('express');
const router = express.Router();

// Impor semua komponen yang dibutuhkan
const AdminPackageController = require('../../controllers/admin/package.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');
const { packageBodyValidationRules, packageIdValidationRules } = require('../../validator/package.validator');

// =================================================================
// PENGAMANAN RUTE: Terapkan middleware untuk SEMUA rute di file ini
// =================================================================
// Setiap permintaan ke /api/admin/packages/... akan melewati dua "penjaga gerbang":
// 1. authMiddleware: Memastikan pengguna sudah login.
// 2. isAdmin: Memastikan pengguna yang login memiliki peran 'admin'.
router.use(authMiddleware, isAdmin);

// =================================================================
// DEFINISI RUTE CRUD (Create, Read, Update, Delete)
// =================================================================

// Rute untuk mendapatkan semua paket (Read All)
// GET /api/admin/packages/
router.get('/', AdminPackageController.getAllPackages);

// Rute untuk membuat paket baru (Create)
// POST /api/admin/packages/
router.post('/', packageBodyValidationRules(), AdminPackageController.createPackage);

// Rute untuk mendapatkan satu paket spesifik berdasarkan ID (Read One)
// GET /api/admin/packages/:id
router.get('/:id', packageIdValidationRules(), AdminPackageController.getPackageById);

// Rute untuk memperbarui paket yang ada (Update)
// PUT /api/admin/packages/:id
router.put('/:id', packageIdValidationRules(), packageBodyValidationRules(), AdminPackageController.updatePackage);

// Rute untuk menghapus paket (Delete)
// DELETE /api/admin/packages/:id
router.delete('/:id', packageIdValidationRules(), AdminPackageController.deletePackage);

module.exports = router;