const db = require('../../../config/database'); // Koneksi DB V1.6
const ApiError = require('../../../utils/apiError');
const { logger } = require('../../../utils/logger');
const { USER_ROLES } = require('../../../config/constants'); // Kita akan buat file ini

class AdminUserService {

    /**
     * @desc Mengambil semua pengguna (admin & customer) dengan paginasi
     * @param {number} page Halaman saat ini
     * @param {number} limit Jumlah item per halaman
     * @returns {Promise<object>} Objek berisi data dan metadata paginasi
     */
    async getAllUsers(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        // Query untuk data (tanpa password_hash)
        const dataQuery = `
            SELECT 
                user_id, 
                full_name, 
                email, 
                phone_number, 
                "role", 
                created_at, 
                updated_at
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        
        // Query untuk total hitungan
        const countQuery = 'SELECT COUNT(*) FROM users';

        // Menjalankan kedua query secara paralel
        const [dataResult, countResult] = await Promise.all([
            db.query(dataQuery, [limit, offset]),
            db.query(countQuery)
        ]);

        const totalUsers = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(totalUsers / limit);

        return {
            users: dataResult.rows,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: page,
                limit
            }
        };
    }

    /**
     * @desc Mengambil detail satu pengguna (tanpa password)
     * @param {string} userId UUID pengguna
     * @returns {Promise<object>} Data pengguna
     */
    async getUserDetails(userId) {
        const query = `
            SELECT 
                user_id, 
                full_name, 
                email, 
                phone_number, 
                "role", 
                created_at, 
                updated_at
            FROM users 
            WHERE user_id = $1
        `;
        const result = await db.query(query, [userId]);

        if (result.rows.length === 0) {
            throw new ApiError(404, 'Pengguna tidak ditemukan.');
        }
        return result.rows[0];
    }

    /**
     * @desc Memperbarui peran (role) seorang pengguna
     * @param {string} userId UUID pengguna yang akan diubah
     * @param {string} newRole Peran baru ('admin' atau 'customer')
     * @returns {Promise<object>} Data pengguna yang telah diperbarui
     */
    async updateUserRole(userId, newRole) {
        // Validasi peran (pastikan newRole adalah 'admin' atau 'customer')
        if (newRole !== USER_ROLES.ADMIN && newRole !== USER_ROLES.CUSTOMER) {
            throw new ApiError(400, `Peran tidak valid. Harus '${USER_ROLES.ADMIN}' atau '${USER_ROLES.CUSTOMER}'.`);
        }

        const query = `
            UPDATE users
            SET "role" = $1, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
            RETURNING user_id, full_name, email, "role"
        `;
        const result = await db.query(query, [newRole, userId]);

        if (result.rows.length === 0) {
            throw new ApiError(404, 'Gagal memperbarui. Pengguna tidak ditemukan.');
        }
        
        logger.warn(`Peran untuk pengguna ${userId} telah diubah menjadi ${newRole} oleh Admin.`);
        return result.rows[0];
    }

    /**
     * @desc Menghapus seorang pengguna (Admin)
     * @param {string} userId UUID pengguna yang akan dihapus
     */
    async deleteUser(userId) {
        try {
            const result = await db.query('DELETE FROM users WHERE user_id = $1', [userId]);
            
            if (result.rowCount === 0) {
                throw new ApiError(404, 'Gagal menghapus. Pengguna tidak ditemukan.');
            }
        } catch (error) {
            // Tangkap error FOREIGN KEY (jika pengguna masih memiliki 'bookings')
            if (error.code === '23503') { // Kode error PostgreSQL untuk 'foreign_key_violation'
                logger.error(`Gagal menghapus ${userId}: Pengguna masih memiliki pesanan (bookings).`, error);
                throw new ApiError(409, 'Gagal menghapus: Pengguna ini masih memiliki riwayat pesanan (bookings).');
            }
            logger.error(`Gagal menghapus ${userId}:`, error);
            throw error;
        }
    }
}

module.exports = new AdminUserService();