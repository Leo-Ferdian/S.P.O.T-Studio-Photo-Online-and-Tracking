// File: api/controllers/admin/package.controller.js
// (DIFAKTORKAN ULANG - V1.11 - Final Fix)
// - PERBAIKAN KRITIS: Memisahkan req.body menjadi 'packageData' dan 'addons'
//   sebelum memanggil service.
// - PERBAIKAN BUG: Menyelaraskan pemanggilan fungsi (getAllPackages -> getFullCatalog, dll.)
// - PERBAIKAN BUG: Menambahkan impor { logger } (V1.9.5)

const asyncHandler = require('../../../utils/asyncHandler');
const apiResponse = require('../../../utils/apiResponse');
const { validationResult } = require('express-validator');
const apiError = require('../../../utils/apiError');
const PackageService = require('../../services/package.service.js');
const { logger } = require('../../../utils/logger');

class AdminPackageController {

    /**
     * @route GET /api/admin/packages
     * @desc Mengambil SEMUA data katalog (Join 4 tabel)
     * @access Admin
     */
    getAllPackages = asyncHandler(async (req, res) => {
        // 1. Ambil query pagination/filter
        const { page = 1, limit = 10, search } = req.query;
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            search: search
        };

        logger.info(`Admin mengambil katalog paket: ${JSON.stringify(options)}`);

        // 2. Ganti nama fungsi service (jika nama file Anda package.service.js)
        const catalog = await PackageService.getAllPackages(options); // Memanggil fungsi baru

        new apiResponse(res, 200, catalog, 'Katalog paket berhasil diambil.');
    });

    /**
     * @route POST /api/admin/packages
     * @desc Membuat paket baru (termasuk addons-nya)
     * @access Admin
     */
    createPackage = asyncHandler(async (req, res) => {
        // 1. Validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // (V1.9.4) Mengembalikan error 400 langsung
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal.',
                errors: errors.array()
            });
        }

        // 2. PERBAIKAN KRITIS (V1.11): Pisahkan 'req.body'
        // 'req.body' Anda (V1.10) adalah: { packageData: {...}, addons: [...] }
        const { packageData, addons } = req.body;

        // 3. Panggil service V1.10 dengan DUA argumen
        const newPackage = await PackageService.createFullPackage(
            packageData, // Argumen 1
            addons         // Argumen 2
        );

        new apiResponse(res, 201, newPackage, 'Paket baru (dan addons-nya) berhasil dibuat.');
    });

    /**
     * @route GET /api/admin/packages/:packageId
     * @desc Mengambil detail satu paket (termasuk addons-nya)
     * @access Admin
     */
    getPackageById = asyncHandler(async (req, res) => {
        // Validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi ID gagal.',
                errors: errors.array()
            });
        }

        const { packageId } = req.params;

        // PERBAIKAN V1.11: Memanggil 'getPackageDetails' (yang mengambil addons)
        const packageDetail = await PackageService.getPackageById(packageId);

        new apiResponse(res, 200, packageDetail, 'Detail paket berhasil diambil.');
    });

    /**
     * @route PUT /api/admin/packages/:packageId
     * @desc Memperbarui paket (termasuk addons-nya)
     * @access Admin
     */
    updatePackage = asyncHandler(async (req, res) => {
        // Validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal.',
                errors: errors.array()
            });
        }

        const { packageId } = req.params;

        // 2. PERBAIKAN KRITIS (V1.11): Pisahkan 'req.body'
        const { packageData, addons } = req.body;

        // 3. Panggil service V1.10 dengan TIGA argumen
        const updatedPackage = await PackageService.updateFullPackage(
            packageId,   // Argumen 1
            packageData, // Argumen 2
            addons       // Argumen 3
        );

        new apiResponse(res, 200, updatedPackage, 'Paket berhasil diperbarui.');
    });

    /**
     * @route DELETE /api/admin/packages/:packageId
     * @desc Menghapus paket (dan addons-nya via ON DELETE CASCADE)
     * @access Admin
     */
    deletePackage = asyncHandler(async (req, res) => {
        // Validasi
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi ID gagal.',
                errors: errors.array()
            });
        }

        const { packageId } = req.params;

        // Panggil service V1.10
        await PackageService.deletePackage(packageId);

        new apiResponse(res, 200, null, 'Paket berhasil dihapus.');
    });
}

module.exports = new AdminPackageController();