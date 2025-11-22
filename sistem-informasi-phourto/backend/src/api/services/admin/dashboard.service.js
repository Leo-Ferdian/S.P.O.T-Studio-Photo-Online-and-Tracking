const db = require('../../../config/database');
const ApiError = require('../../../utils/apiError');
const { logger } = require('../../../utils/logger');
const { BOOKING_STATUS } = require('../../../config/constants'); // Asumsi Anda punya ini

class DashboardService {

    /**
     * @function getDashboardStats
     * @desc Melakukan 3 kueri paralel untuk mengambil statistik dashboard.
     */
    async getDashboardStats() {
        try {
            // Kita akan menjalankan 3 kueri ini secara bersamaan 
            // untuk efisiensi menggunakan Promise.all

            // Kueri 1: Hitung total booking yang sudah dibayar (bukan PENDING atau EXPIRED)
            const bookingsQuery = db.query(
                `SELECT COUNT(*) FROM bookings 
                WHERE payment_status NOT IN ($1, $2, $3)`,
                [BOOKING_STATUS.PENDING, BOOKING_STATUS.EXPIRED, BOOKING_STATUS.CANCELLED]
            );

            // Kueri 2: Hitung total pendapatan dari booking yang sudah dibayar
            const revenueQuery = db.query(
                `SELECT COALESCE(SUM(amount_paid), 0) AS totalRevenue 
                FROM bookings 
                WHERE payment_status IN ($1, $2, $3)`,
                [BOOKING_STATUS.PAID_DP, BOOKING_STATUS.PAID_FULL, BOOKING_STATUS.COMPLETED]
            );


            // Kueri 3: Hitung pengguna baru (customer) dalam 30 hari terakhir
            const usersQuery = db.query(
                `SELECT COUNT(*) FROM users 
                WHERE role = 'customer' AND created_at >= NOW() - INTERVAL '30 days'`
            );

            // Tunggu semua kueri selesai
            const [bookingsResult, revenueResult, usersResult] = await Promise.all([
                bookingsQuery,
                revenueQuery,
                usersQuery
            ]);

            // Ambil dan format datanya
            // Ini HARUS SAMA dengan yang diharapkan frontend
            const stats = {
                totalBookings: parseInt(bookingsResult.rows[0].count, 10) || 0,
                totalRevenue: parseFloat(revenueResult.rows[0].totalrevenue) || 0,
                newUsers: parseInt(usersResult.rows[0].count, 10) || 0
            };

            return stats;

        } catch (error) {
            logger.error('Error in getDashboardStats:', error);
            throw new ApiError('Gagal mengambil data statistik.', 500);
        }
    }
}

module.exports = new DashboardService();