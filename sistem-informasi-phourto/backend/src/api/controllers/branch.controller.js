const BranchService = require('../services/branch.service');

class BranchController {
    async getAll(req, res) {
        try {
            const branches = await BranchService.getAllBranches();
            res.status(200).json(branches);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil data cabang.' });
        }
    }
}

module.exports = new BranchController();