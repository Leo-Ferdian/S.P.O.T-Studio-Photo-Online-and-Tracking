const express = require('express');
const router = express.Router();

// Impor komponen
const AdminBranchController = require('../../controllers/admin/branch.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');

// --- PERBAIKAN DI BAWAH INI ---
// Impor KEDUA fungsi validator dari file yang sama
const { 
    branchIdValidationRules, 
    branchValidationRules // <-- Tambahkan ini
} = require('../../validator/branch.validator');
// --- AKHIR PERBAIKAN ---

// Terapkan middleware untuk semua rute di file ini
router.use(authMiddleware, isAdmin);

// Rute untuk mendapatkan semua cabang (R)
router.get('/', AdminBranchController.getAllBranches);

// Rute untuk membuat cabang baru (C)
router.post('/', branchValidationRules(), AdminBranchController.createBranch); // <-- Baris ini sekarang valid

// Rute untuk mendapatkan satu cabang berdasarkan ID (R)
router.get('/:id', branchIdValidationRules(), AdminBranchController.getBranchById);

// Rute untuk memperbarui cabang (U)
router.put('/:id', branchIdValidationRules(), branchValidationRules(), AdminBranchController.updateBranch);

// Rute untuk menghapus cabang (D)
router.delete('/:id', branchIdValidationRules(), AdminBranchController.deleteBranch);

module.exports = router;