const express = require('express');
const router = express.Router();

const BranchController = require('../controllers/branch.controller'); 
const asyncHandler = require('../../utils/asyncHandler');

const { 
    branchIdValidationRules
} = require('../validator/branch.validator'); 

// Rute untuk mendapatkan semua cabang studio (Publik)
// GET /api/branches
router.get('/', asyncHandler(BranchController.getAll)); // <-- Pastikan 'getAll' ada di controller

// Rute untuk mendapatkan cabang berdasarkan ID (Publik)
// GET /api/branches/:id
router.get(
    '/:id', 
    branchIdValidationRules(),
    asyncHandler(BranchController.getById)
);


module.exports = router;