const PackageService = require('../services/package.service');
const apiResponse = require('../../utils/apiResponse');
const apiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');

class PackageController {
    getAll = asyncHandler(async (req, res, next) => {
        const packages = await PackageService.getAllPackages();
        if (!packages || packages.length === 0) {
            throw new apiError('Tidak ada data paket tersedia.', 404); // Not Found
        }
        new apiResponse(res, 200, packages, 'Data paket berhasil diambil.');
    });
    // async getAll(req, res) {
    //     try {
    //         const packages = await PackageService.getAllPackages();
    //         new responseHandler(res, 200, packages, 'Data paket berhasil diambil.');
    //         // res.status(200).json({
    //         //     message: 'Data paket berhasil diambil.',
    //         //     data: packages
    //         // });
    //     } catch (error) {
    //         console.error(error);
    //         throw new apiError('Gagal mengambil data paket.', 500);
    //         // res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    //     }
    // }
}

module.exports = new PackageController();