const BranchService = require('../services/branch.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { validationResult } = require('express-validator');

class BranchController {

    /**
     * @route GET /api/branches/
     * @desc Mengambil semua daftar cabang
     * @access Publik
     */
    getAll = asyncHandler(async (req, res) => {
        // Panggil service untuk mengambil semua cabang
        const branches = await BranchService.getAllBranches(); 
        
        if (!branches || branches.length === 0) {
            throw new ApiError(404, 'Tidak ada data cabang tersedia.');
        }
        
        new ApiResponse(res, 200, branches, 'Data cabang berhasil diambil.');
    });

    /**
     * @route GET /api/branches/:id
     * @desc Mengambil detail satu cabang berdasarkan ID
     * @access Publik
     */
    getById = asyncHandler(async (req, res) => {
        // Validasi sudah berjalan di route, kita hanya perlu menangkap error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi ID gagal.', errors.array()); 
        }

        const { id } = req.params; 

        // Panggil service untuk mengambil detail cabang (error 404 ditangani di service)
        const branchDetail = await BranchService.getBranchById(id);
        
        new ApiResponse(res, 200, branchDetail, `Detail cabang ${id} berhasil diambil.`);
    });
}

module.exports = new BranchController();