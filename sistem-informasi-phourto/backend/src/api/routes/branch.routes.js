const express = require('express');
const router = express.Router();
const BranchController = require('../controllers/branch.controller');
const asyncHandler = require('../../utils/asyncHandler');
const { getBranchByIdValidationRules } = require('../validator/branch.validator');
// const authenticateToken = require('../middlewares/auth.middleware');

// Rute untuk mendapatkan semua cabang studio
// GET /api/branches
router.get('/', asyncHandler(BranchController.getAll)); //tanpa autentikasi

// Rute untuk mendapatkan cabang berdasarkan ID
// GET /api/branches/:id
router.get('/:id', getBranchByIdValidationRules, asyncHandler(BranchController.getById));

// Rute ini tidak memerlukan autentikasi, bisa diakses publik
// Jika di masa depan perlu autentikasi, tambahkan middleware authenticateToken
// Contoh: router.get('/', authenticateToken, BranchController.getAll);
// router.get('/:id', authenticateToken, asyncHandler(BranchController.getById));
router.get('/:id', asyncHandler(BranchController.getById)); //tanpa autentikasi

module.exports = router;