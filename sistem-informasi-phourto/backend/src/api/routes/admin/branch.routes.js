const express = require('express');
const router = express.Router();
const AdminBranchController = require('../../controllers/admin/branch.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');

const { 
    branchIdValidationRules, 
    branchValidationRules 
} = require('../../validator/branch.validator');

// 2. Terapkan Middleware Keamanan
// Semua rute di file ini dilindungi (hanya Admin bisa akses)
router.use(authMiddleware, isAdmin);

// 3. Definisikan Rute CRUD

// GET /api/admin/branches
// (R)ead All
router.get('/', AdminBranchController.getAllBranches);

// POST /api/admin/branches
// (C)reate
router.post(
    '/', 
    branchValidationRules(), 
    AdminBranchController.createBranch
);

// GET /api/admin/branches/:branchId
// (R)ead One
router.get(
    '/:branchId', 
    branchIdValidationRules(), 
    AdminBranchController.getBranchById
);

// PUT /api/admin/branches/:branchId
// (U)pdate
router.put(
    '/:branchId', 
    branchIdValidationRules(), 
    branchValidationRules(), 
    AdminBranchController.updateBranch
);

// DELETE /api/admin/branches/:branchId
// (D)elete
router.delete(
    '/:branchId', 
    branchIdValidationRules(), 
    AdminBranchController.deleteBranch
);

module.exports = router;