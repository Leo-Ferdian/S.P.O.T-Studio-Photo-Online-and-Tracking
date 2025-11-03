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
    async getAllUsers(options = {}) {
        // 1. Destrukturisasi parameter dengan nilai default
        const { page = 1, limit = 10, search } = options;
        const offset = (page - 1) * limit;

        // 2. Query dasar untuk data dan hitung total
        let dataQuery = `
        SELECT 
            user_id, 
            full_name, 
            email, 
            phone_number, 
            "role", 
            created_at, 
            updated_at
        FROM users
        `;
        let countQuery = 'SELECT COUNT(*) FROM users';

        // 3. Siapkan parameter dan kondisi WHERE
        const queryParams = [];
        const countParams = [];
        const whereClauses = [];

        // 4. Tambahkan filter pencarian (nama atau email)
        if (search) {
            queryParams.push(`%${search}%`);
            countParams.push(`%${search}%`);
            whereClauses.push(`(full_name ILIKE $1 OR email ILIKE $1)`);
        }

        // (Opsional) Tambahkan filter tambahan seperti 'role' di masa depan
        // if (options.role) { ... }

        // 5. Gabungkan WHERE jika ada
        if (whereClauses.length > 0) {
            const whereString = ` WHERE ${whereClauses.join(' AND ')}`;
            dataQuery += whereString;
            countQuery += whereString;
        }

        // 6. Tambahkan ORDER, LIMIT, dan OFFSET
        dataQuery += `
            ORDER BY created_at DESC 
            LIMIT $${queryParams.length + 1} 
            OFFSET $${queryParams.length + 2}
        `;
        queryParams.push(limit, offset);

        // 7. Jalankan kedua query secara paralel
        const [dataResult, countResult] = await Promise.all([
            db.query(dataQuery, queryParams),
            db.query(countQuery, countParams)
        ]);

        // 8. Hitung total dan pagination
        const total = parseInt(countResult.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        // 9. Kembalikan hasil dalam format yang konsisten dengan frontend
        return {
            data: dataResult.rows,
            pagination: {
                total,
                totalPages,
                page,
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
     * @desc Memperbarui detail profil (nama, email, hp) seorang pengguna
     * @param {string} userId UUID pengguna yang akan diubah
     * @param {object} profileData Objek berisi { full_name, email, phone_number }
     * @returns {Promise<object>} Data pengguna yang telah diperbarui
     */
    async updateUserProfile(userId, profileData) {
        const { full_name, email, phone_number } = profileData;

        // Validasi sederhana (validator di rute seharusnya sudah menangani ini)
        if (!full_name || !email || !phone_number) {
            throw new ApiError(400, 'Nama lengkap, email, dan nomor telepon harus diisi.');
        }

        const query = `
            UPDATE users
            SET 
                full_name = $1, 
                email = $2, 
                phone_number = $3, 
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $4
            RETURNING user_id, full_name, email, phone_number, "role"; 
        `;

        try {
            const result = await db.query(query, [full_name, email, phone_number, userId]);

            if (result.rows.length === 0) {
                throw new ApiError(404, 'Gagal memperbarui. Pengguna tidak ditemukan.');
            }

            logger.info(`Profil untuk pengguna ${userId} telah diperbarui oleh Admin.`);
            return result.rows[0];

        } catch (error) {
            // Tangkap error duplikat email
            if (error.code === '23505') { // PostgreSQL unique_violation
                logger.error(`Gagal update profil ${userId}: Email ${email} sudah terdaftar.`, error);
                throw new ApiError(409, 'Email ini sudah terdaftar. Silakan gunakan email lain.');
            }
            logger.error(`Gagal memperbarui profil ${userId}:`, error);
            if (error instanceof ApiError) throw error; // Lempar ulang ApiError
            throw new ApiError('Gagal memperbarui profil pengguna.', 500);
        }
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