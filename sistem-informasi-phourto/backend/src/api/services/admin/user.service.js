const db = require('../../../config/database');
const ApiError = require('../../../utils/apiError');
const { logger } = require('../../../utils/logger');

class AdminUserService {

    /**
     * Mengambil daftar semua pengguna dengan paginasi.
     * @param {number} page - Nomor halaman saat ini.
     * @param {number} limit - Jumlah item per halaman.
     * @returns {Promise<object>} - Objek berisi data pengguna dan info paginasi.
     */
    async getAllUsers(page = 1, limit = 10) {
        logger.info(`Fetching all users, page: ${page}, limit: ${limit}`);
        const offset = (page - 1) * limit;

        // Query untuk mengambil data pengguna (tanpa password)
        const usersQuery = `
            SELECT id, full_name, email, whatsapp_number, role, created_at, updated_at 
            FROM phourto.users 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        `;
        const usersResult = await db.query(usersQuery, [limit, offset]);

        // Query untuk menghitung total pengguna
        const countQuery = 'SELECT COUNT(*) FROM phourto.users';
        const countResult = await db.query(countQuery);
        const totalUsers = parseInt(countResult.rows[0].count, 10);

        return {
            data: usersResult.rows,
            pagination: {
                total: totalUsers,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalPages: Math.ceil(totalUsers / limit)
            }
        };
    }

    // --- Fungsi Admin Lainnya Bisa Ditambahkan Di Sini ---
    // async deleteUser(userId) { ... }
    // async updateUserRole(userId, role) { ... }

}

module.exports = new AdminUserService();