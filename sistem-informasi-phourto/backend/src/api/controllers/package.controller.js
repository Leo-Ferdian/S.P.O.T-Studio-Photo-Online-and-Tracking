const PackageService = require('../services/package.service');

class PackageController {
    async getAll(req, res) {
        try {
            const packages = await PackageService.getAllPackages();
            res.status(200).json(packages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil data paket.' });
        }
    }
}

module.exports = new PackageController();