const BranchService = require('../../services/branch.service');
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/apiResponse');
const { validationResult } = require('express-validator');

class AdminBranchController {
    // C: Create
    createBranch = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const newBranch = await BranchService.createBranch(req.body);
        new ApiResponse(res, 201, newBranch, 'Cabang baru berhasil dibuat.');
    });

    // R: Read All
    getAllBranches = asyncHandler(async (req, res) => {
        const branches = await BranchService.getAllBranches();
        new ApiResponse(res, 200, branches, 'Semua data cabang berhasil diambil.');
    });

    // R: Read One
    getBranchById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const branchData = await BranchService.getBranchById(id);
        new ApiResponse(res, 200, branchData, 'Detail cabang berhasil diambil.');
    });

    // U: Update
    updateBranch = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const updatedBranch = await BranchService.updateBranch(id, req.body);
        new ApiResponse(res, 200, updatedBranch, 'Data cabang berhasil diperbarui.');
    });

    // D: Delete
    deleteBranch = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await BranchService.deleteBranch(id);
        new ApiResponse(res, 200, null, 'Cabang berhasil dihapus.');
    });
}

module.exports = new AdminBranchController();