const PackageService = require('../services/package.service');
const responseHandler = require('../../utils/responseHandler');
const apiError = require('../../utils/apiError');

class PackageController {
    async getAll(req, res) {
        try {
            const packages = await PackageService.getAllPackages();
            new responseHandler(res, 200, packages, 'Data paket berhasil diambil.');
            // res.status(200).json({
            //     message: 'Data paket berhasil diambil.',
            //     data: packages
            // });
        } catch (error) {
            console.error(error);
            throw new apiError('Gagal mengambil data paket.', 500);
            // res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
    }
}

module.exports = new PackageController();