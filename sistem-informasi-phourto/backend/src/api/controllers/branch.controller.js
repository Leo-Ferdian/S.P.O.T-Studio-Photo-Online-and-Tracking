const BranchService = require('../services/branch.service');
const apiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');
const responseHandler = require('../../utils/responseHandler');

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
            throw new apiError('Tidak ada data cabang tersedia.', 404); // Not Found
        }

        new responseHandler(res, 200, branches, 'Data cabang berhasil diambil.');
    });
    getById = asyncHandler(async (req, res, next) => {
        const branchId = parseInt(req.params.id, 10);
        if (isNaN(branchId)) {
            throw new apiError('ID cabang tidak valid.', 400); // Bad Request jika bukan angka
        }
        const branch = await BranchService.getBranchById(branchId);

        new responseHandler(res, 200, branch, 'Detail cabang berhasil diambil.');
    });
}

module.exports = new BranchController();