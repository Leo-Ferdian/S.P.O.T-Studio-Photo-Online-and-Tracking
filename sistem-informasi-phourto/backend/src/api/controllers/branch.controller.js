const BranchService = require('../services/branch.service');
const apiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');

// class BranchController {
//     async getAll(req, res) {
//         try {
//             const branches = await BranchService.getAllBranches();
//             res.status(200).json(branches);
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: 'Terjadi kesalahan pada server saat mengambil data cabang.' });
//         }
//     }
// }
class BranchController {
    getAll = asyncHandler(async (req, res, next) => {
        const branches = await BranchService.getAllBranches();

        if (!branches || branches.length === 0) {
            // kalau tidak ada data, lempar error dengan apiError
            return next(new apiError('Tidak ada data cabang yang tersedia.', 404));
        }

        return res.status(200).json({
            success: true,
            data: branches
        });
    });
    getById = asyncHandler(async (req, res, next) => {
        const branchId = parseInt(req.params.id, 10);
        if (isNaN(branchId)) {
            return next(new apiError('ID cabang harus berupa angka.', 400));
        }
        const branch = await BranchService.getBranchById(branchId);

        return res.status(200).json({
            success: true,
            data: branch
        });
    });
}

module.exports = new BranchController();