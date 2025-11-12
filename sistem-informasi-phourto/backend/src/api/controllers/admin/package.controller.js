// File: api/controllers/admin/package.controller.js
const asyncHandler = require('../../../utils/asyncHandler');
const apiResponse = require('../../../utils/apiResponse');
const { validationResult } = require('express-validator');
const apiError = require('../../../utils/apiError');
const PackageService = require('../../services/package.service.js');
const { logger } = require('../../../utils/logger');

class AdminPackageController {

    /**
     * @route GET /api/admin/packages
     */
    getAllPackages = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, search } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            search: search
        };
        logger.info(`Admin mengambil katalog paket: ${JSON.stringify(options)}`);
        const catalog = await PackageService.getAllPackages(options);
        new apiResponse(res, 200, catalog, 'Katalog paket berhasil diambil.');
    });

    /**
     * @route POST /api/admin/packages
     */
    createPackage = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal.',
                errors: errors.array()
            });
        }

        // (Fungsi ini sudah benar, 'createFullPackage' ada di service Anda [cite: 1-260])
        const { packageData, addons } = req.body;
        const newPackage = await PackageService.createFullPackage(
            packageData,
            addons
        );

        new apiResponse(res, 201, newPackage, 'Paket baru (dan addons-nya) berhasil dibuat.');
    });

    /**
     * @route GET /api/admin/packages/:packageId
     */
    getPackageById = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi ID gagal.',
                errors: errors.array()
            });
        }
        const { packageId } = req.params;

        // (Fungsi ini sudah benar, 'getPackageById' ada di service Anda [cite: 1-260])
        const packageDetail = await PackageService.getPackageById(packageId);

        new apiResponse(res, 200, packageDetail, 'Detail paket berhasil diambil.');
    });

    /**
     * @route PUT /api/admin/packages/:packageId
     */
    updatePackage = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal.',
                errors: errors.array()
            });
        }

        const { packageId } = req.params;
        const { packageData, addons } = req.body;

        // --- PERBAIKAN DI SINI ---
        // Ganti 'updateFullPackage' -> 'updatePackage'
        // Hapus argumen 'addons' (karena service [cite: 1-260] tidak menerimanya)
        const updatedPackage = await PackageService.updatePackage(
            packageId,   // Argumen 1
            packageData  // Argumen 2
        );
        // ------------------------

        new apiResponse(res, 200, updatedPackage, 'Paket berhasil diperbarui.');
    });

    /**
     * @route DELETE /api/admin/packages/:packageId
     */
    deletePackage = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi ID gagal.',
                errors: errors.array()
            });
        }
        const { packageId } = req.params;

        // (Fungsi ini sudah benar, 'deletePackage' ada di service Anda [cite: 1-260])
        await PackageService.deletePackage(packageId);

        new apiResponse(res, 200, null, 'Paket berhasil dihapus.');
    });
}

module.exports = new AdminPackageController();