const PackageService = require('../services/package.service');
const apiResponse = require('../../utils/apiResponse');
const apiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const { validationResult } = require('express-validator'); // Diperlukan untuk validasi

class PackageController {
    
    /**
     * @route GET /api/packages/
     * @desc Mengambil daftar paket sederhana untuk keperluan dropdown/list.
     * @access Publik
     */
    getAll = asyncHandler(async (req, res) => {
        // Panggil service yang tidak melakukan JOIN (lebih cepat)
        const packages = await PackageService.getAllPackages(); 
        
        if (!packages || packages.length === 0) {
            throw new apiError('Tidak ada data paket tersedia.', 404); // Not Found
        }
        
        new apiResponse(res, 200, packages, 'Data paket berhasil diambil.');
    });

    /**
     * @route GET /api/packages/catalog
     * @desc Mengambil daftar paket lengkap, digabungkan dengan Rooms dan Branches (JOIN).
     * @access Publik
     */
    getFullCatalog = asyncHandler(async (req, res) => {
        // Panggil service yang melakukan JOIN 3-tabel
        const catalog = await PackageService.getAllPackages(); 
        
        if (!catalog || catalog.length === 0) {
            throw new apiError('Katalog paket tidak tersedia.', 404); 
        }
        
        new apiResponse(res, 200, catalog, 'Katalog lengkap berhasil diambil.');
    });

    /**
     * @route GET /api/packages/:packageId
     * @desc Mendapatkan detail paket tunggal termasuk semua addons.
     * @access Publik
     */
    getPackageById = asyncHandler(async (req, res) => {
        const { packageId } = req.params; 

        // Cek dasar (bisa diganti dengan validator express-validator)
        if (!packageId) {
            throw new apiError('ID Paket wajib diisi.', 400);
        }

        // Panggil service yang mengambil detail paket + addons
        // Error 404 sudah ditangani oleh PackageService
        const packageDetail = await PackageService.getPackageById(packageId); 
        
        new apiResponse(res, 200, packageDetail, `Detail paket ${packageId} berhasil diambil.`);
    });
}

module.exports = new PackageController();