const DashboardService = require('../../services/admin/dashboard.service'); // Service yang akan kita buat
const asyncHandler = require('../../../utils/asyncHandler');
const apiResponse = require('../../../utils/apiResponse');

class DashboardController {

    /**
     * @route GET /api/admin/dashboard/stats
     * @desc Mengambil data statistik untuk kartu dashboard
     */
    getStats = asyncHandler(async (req, res) => {

        // Panggil service untuk mengambil data
        const stats = await DashboardService.getDashboardStats();

        // Kirim respons
        new apiResponse(res, 200, stats, 'Data statistik berhasil diambil.');
    });
}

module.exports = new DashboardController();