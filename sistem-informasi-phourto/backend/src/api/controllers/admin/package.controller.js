const AdminPackageService = require('../../services/admin/package.service');
const asyncHandler = require('../../../utils/asyncHandler');
const apiResponse = require('../../../utils/apiResponse');
const { validationResult } = require('express-validator');
const apiError = require('../../../utils/apiError');

class AdminPackageController {

    // GET / (Read All)
    getAllPackages = asyncHandler(async (req, res) => {
        // Logika untuk mengambil data (nanti diisi service)
        const packages = [{ id: 1, name: "Paket A" }]; 
        new apiResponse(res, 200, packages, 'Semua paket berhasil diambil.');
    });

    // POST / (Create)
    createPackage = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }
        
        // TODO: Panggil AdminPackageService.createPackage(req.body)
        const newPackage = { id: 2, ...req.body };
        
        new apiResponse(res, 201, newPackage, 'Paket baru berhasil dibuat.');
    });

    // GET /:id (Read One)
    getPackageById = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi ID gagal.', errors.array());
        }
        
        // TODO: Panggil AdminPackageService.getPackageById(req.params.id)
        const packageDetail = { id: req.params.id, name: "Paket Detail" };

        new apiResponse(res, 200, packageDetail, 'Detail paket berhasil diambil.');
    });

    // PUT /:id (Update)
    updatePackage = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        // TODO: Panggil AdminPackageService.updatePackage(req.params.id, req.body)
        const updatedPackage = { id: req.params.id, ...req.body };
        
        new apiResponse(res, 200, updatedPackage, 'Paket berhasil diperbarui.');
    });

    // DELETE /:id (Delete)
    deletePackage = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi ID gagal.', errors.array());
        }

        // TODO: Panggil AdminPackageService.deletePackage(req.params.id)
        
        new apiResponse(res, 200, null, 'Paket berhasil dihapus.');
    });
}

module.exports = new AdminPackageController();