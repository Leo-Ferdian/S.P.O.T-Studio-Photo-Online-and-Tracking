const asyncHandler = require('../../../utils/asyncHandler');
const apiResponse = require('../../../utils/apiResponse');
const { validationResult } = require('express-validator');
const apiError = require('../../../utils/apiError');
const BranchService = require('../../services/branch.service.js');
const { logger } = require('../../../utils/logger');

class AdminBranchController {

    /**
     * @route GET /api/admin/branches
     * @desc Mengambil semua cabang
     * @access Admin
     */
    getAllBranches = asyncHandler(async (req, res) => {
        // Panggil service V1.10
        const branches = await BranchService.getAllBranches();
        new apiResponse(res, 200, branches, 'Semua cabang berhasil diambil.');
    });

    /**
     * @route POST /api/admin/branches
     * @desc Membuat cabang baru
     * @access Admin
     */
    createBranch = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        // Panggil service V1.10
        // req.body harus berisi { branch_name, address, open_hours }
        const newBranch = await BranchService.createBranch(req.body);
        new apiResponse(res, 201, newBranch, 'Cabang baru berhasil dibuat.');
    });

    /**
     * @route GET /api/admin/branches/:branchId
     * @desc Mengambil detail satu cabang
     * @access Admin
     */
    getBranchById = asyncHandler(async (req, res) => {
        // Validasi (Diasumsikan rute memiliki param('branchId').isUUID())
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi ID gagal.', errors.array());
        }

        const { branchId } = req.params;
        
        // Panggil service V1.10
        const branch = await BranchService.getBranchById(branchId);
        // Service V1.10 kita sudah menangani error 404 jika tidak ditemukan
        
        new apiResponse(res, 200, branch, 'Detail cabang berhasil diambil.');
    });

    /**
     * @route PUT /api/admin/branches/:branchId
     * @desc Memperbarui cabang
     * @access Admin
     */
    updateBranch = asyncHandler(async (req, res) => {
        // Validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        const { branchId } = req.params;
        const branchData = req.body;

        // Panggil service V1.10
        const updatedBranch = await BranchService.updateBranch(branchId, branchData);
        // Service V1.10 kita sudah menangani error 404
        
        new apiResponse(res, 200, updatedBranch, 'Cabang berhasil diperbarui.');
    });

    /**
     * @route DELETE /api/admin/branches/:branchId
     * @desc Menghapus cabang
     * @access Admin
     */
    deleteBranch = asyncHandler(async (req, res) => {
        // Validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi ID gagal.', errors.array());
        }

        const { branchId } = req.params;

        // Panggil service V1.10
        // Service V1.10 kita akan gagal (error 500) jika cabang masih memiliki relasi (rooms)
        // Ini adalah perilaku ON DELETE RESTRICT yang kita inginkan.
        await BranchService.deleteBranch(branchId);
        // Service V1.10 kita sudah menangani error 404
        
        new apiResponse(res, 200, null, 'Cabang berhasil dihapus.');
    });
}

module.exports = new AdminBranchController();