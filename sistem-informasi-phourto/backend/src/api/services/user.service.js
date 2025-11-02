const db = require('../../config/database'); // Koneksi DB V1.6
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');
const bcrypt = require('bcryptjs');

class UserService {

    /**
     * @desc Mengambil profil pengguna yang sedang login (tanpa password)
     * @param {string} userId UUID pengguna
     * @returns {Promise<object>} Data profil pengguna
     */
    async getUserProfile(userId) {
        const query = `
            SELECT 
                user_id, 
                full_name, 
                email, 
                phone_number, 
                "role", 
                created_at
            FROM users 
            WHERE user_id = $1
        `;
        const result = await db.query(query, [userId]);

        if (result.rows.length === 0) {
            throw new ApiError(404, 'Profil pengguna tidak ditemukan.');
        }
        return result.rows[0];
    }

    /**
     * @desc Memperbarui profil pengguna (Nama & No. HP)
     * @param {string} userId UUID pengguna
     * @param {object} updateData Data baru (full_name, phone_number)
     * @returns {Promise<object>} Data pengguna yang telah diperbarui
     */
    async updateUserProfile(user_id, updateData) { 
        const { full_name, phone_number } = updateData; 
        
        if (!full_name || !phone_number) {
            throw new ApiError(400, 'Nama lengkap dan nomor telepon wajib diisi.');
        }
        
        // 1. Ambil data lama (untuk perbandingan dan update)
        const oldUserResult = await db.query('SELECT full_name, phone_number FROM users WHERE user_id = $1', [user_id]);
        if (oldUserResult.rows.length === 0) {
            throw new ApiError(404, 'Profil pengguna tidak ditemukan.');
        }
        const oldPhoneNumber = oldUserResult.rows[0].phone_number;

        // 2. CEK DUPLIKASI CERDAS (CRITICAL FIX V1.11)
        // Lakukan pengecekan duplikasi HANYA jika nomor telepon BERUBAH
        if (phone_number !== oldPhoneNumber) {
             // Cek apakah user LAIN sudah memakai phone_number baru ini
            const conflictCheck = await db.query(
                // user_id != $2 sudah memastikan kita tidak menghitung diri sendiri
                'SELECT user_id FROM users WHERE phone_number = $1 AND user_id != $2', 
                [phone_number, user_id]
            );
            
            if (conflictCheck.rows.length > 0) {
                logger.warn(`Update gagal: Nomor HP ${phone_number} sudah dipakai oleh user lain.`);
                throw new ApiError(409, `Nomor HP ${phone_number} sudah terdaftar oleh pengguna lain.`);
            }
        }
        
        // 3. Update data (menggunakan updateData dari payload)
        const result = await db.query(
            `UPDATE users SET full_name = $1, phone_number = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = $3 
            RETURNING user_id, full_name, email, phone_number, "role", updated_at`,
            [full_name, phone_number, user_id]
        );

        return result.rows[0];
    }

    /**
     * @desc Mengganti password pengguna
     * @param {string} userId UUID pengguna
     * @param {string} currentPassword Password lama
     * @param {string} newPassword Password baru
     */
    async changeUserPassword(userId, currentPassword, newPassword) {
        // 1. Ambil hash password lama dari DB
        const userResult = await db.query('SELECT password_hash FROM users WHERE user_id = $1', [userId]);
        if (userResult.rows.length === 0) {
            throw new ApiError(404, 'User tidak ditemukan.');
        }
        
        const storedHash = userResult.rows[0].password_hash;

        // 2. Bandingkan password lama
        const isMatch = await bcrypt.compare(currentPassword, storedHash);
        if (!isMatch) {
            throw new ApiError(400, 'Password Anda saat ini salah.');
        }

        // 3. Hash password baru
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update password di DB
        await db.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [hashedNewPassword, userId]);
        
        logger.info(`Password untuk user ${userId} telah diubah.`);
    }

    /**
     * @desc Menghapus akun PENGGUNA SENDIRI
     * @param {string} userId UUID pengguna
     */
    async deleteUserAccount(userId) {
        try {
            const result = await db.query('DELETE FROM users WHERE user_id = $1', [userId]);
            
            if (result.rowCount === 0) {
                throw new ApiError(404, 'Gagal menghapus. Pengguna tidak ditemukan.');
            }
            logger.warn(`Akun pengguna ${userId} telah dihapus oleh pengguna sendiri.`);

        } catch (error) {
            // Tangkap error FOREIGN KEY (jika pengguna masih memiliki 'bookings')
            if (error.code === '23503') { // foreign_key_violation
                logger.error(`Gagal menghapus ${userId}: Pengguna masih memiliki pesanan (bookings).`, error);
                throw new ApiError(409, 'Gagal menghapus: Anda masih memiliki riwayat pesanan (bookings). Harap hubungi admin.');
            }
            logger.error(`Gagal menghapus ${userId}:`, error);
            throw error;
        }
    }
}

module.exports = new UserService();