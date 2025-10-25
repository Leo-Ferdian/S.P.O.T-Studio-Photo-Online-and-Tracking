const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/package.controller');

// Rute untuk mendapatkan semua paket foto
// GET /api/packages
router.get('/', PackageController.getAll);

// Impor komponen
const AdminPackageController = require('../controllers/admin/package.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/admin.middleware'); // <-- Impor middleware admin

// Terapkan middleware untuk semua rute di file ini
// Permintaan harus lolos dari authMiddleware DULU, baru kemudian isAdmin
router.use(authMiddleware, isAdmin);

// Sekarang, semua rute di bawah ini secara otomatis dilindungi
// dan hanya bisa diakses oleh admin.

// Rute untuk membuat paket baru
// POST /api/admin/packages
router.post('/', AdminPackageController.createPackage);

// Rute untuk memperbarui paket
// PUT /api/admin/packages/:id
router.put('/:id', AdminPackageController.updatePackage);

// Rute untuk menghapus paket
// DELETE /api/admin/packages/:id
router.delete('/:id', AdminPackageController.deletePackage);

module.exports = router;