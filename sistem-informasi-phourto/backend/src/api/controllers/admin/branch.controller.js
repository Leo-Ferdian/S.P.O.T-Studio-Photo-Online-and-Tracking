const asyncHandler = require('../../../utils/asyncHandler');
const apiResponse = require('../../../utils/apiResponse');
const { validationResult } = require('express-validator');
const apiError = require('../../../utils/apiError');
// const AdminBranchService = require('../../services/admin/branch.service'); // Nanti

class AdminBranchController {

    // GET /
    getAllBranches = asyncHandler(async (req, res) => {
        const branches = [{ id: 1, name: "Cabang Pusat" }];
        new apiResponse(res, 200, branches, 'Semua cabang berhasil diambil.');
    });

    // POST /
    createBranch = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }
        const newBranch = { id: 2, ...req.body };
        new apiResponse(res, 201, newBranch, 'Cabang baru berhasil dibuat.');
    });

    // GET /:id
    getBranchById = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi ID gagal.', errors.array());
        }
        const branch = { id: req.params.id, name: "Cabang Detail" };
        new apiResponse(res, 200, branch, 'Detail cabang berhasil diambil.');
    });

    // PUT /:id
    updateBranch = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }
        const updatedBranch = { id: req.params.id, ...req.body };
        new apiResponse(res, 200, updatedBranch, 'Cabang berhasil diperbarui.');
    });

    // DELETE /:id
    deleteBranch = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi ID gagal.', errors.array());
        }
        new apiResponse(res, 200, null, 'Cabang berhasil dihapus.');
    });
}

module.exports = new AdminBranchController();