const PackageService = require('../../services/package.service');
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/apiResponse');
const { validationResult } = require('express-validator');

class AdminPackageController {
    // C: Create a new package
    createPackage = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const newPackage = await PackageService.createPackage(req.body);
        new ApiResponse(res, 201, newPackage, 'Paket baru berhasil dibuat.');
    });

    // R: Read all packages
    getAllPackages = asyncHandler(async (req, res) => {
        const packages = await PackageService.getAllPackages();
        new ApiResponse(res, 200, packages, 'Semua data paket berhasil diambil.');
    });

    // R: Read one package by ID
    getPackageById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const packageData = await PackageService.getPackageById(id);
        new ApiResponse(res, 200, packageData, 'Detail paket berhasil diambil.');
    });

    // U: Update an existing package
    updatePackage = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const updatedPackage = await PackageService.updatePackage(id, req.body);
        new ApiResponse(res, 200, updatedPackage, 'Data paket berhasil diperbarui.');
    });

    // D: Delete a package
    deletePackage = asyncHandler(async (req, res) => {
        const { id } = req.params;
        await PackageService.deletePackage(id);
        new ApiResponse(res, 200, null, 'Paket berhasil dihapus.');
    });
}

module.exports = new AdminPackageController();