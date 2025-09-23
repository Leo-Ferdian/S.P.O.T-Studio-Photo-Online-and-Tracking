const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const ApiError = require('../../utils/apiError');

class UserService {
    /**
     * Mengambil detail profil pengguna berdasarkan ID.
     * @param {number} userId - ID pengguna.
     * @returns {object} - Data profil pengguna (tanpa password).
     */
    async getUserProfileById(userId) {
        const result = await db.query(
            'SELECT id, full_name, email, whatsapp_number, created_at FROM phourto.users WHERE id = $1',
            [userId]
        );
        if (result.rows.length === 0) {
            throw new ApiError(404, 'Pengguna tidak ditemukan.');
        }
        return result.rows;
    }

    /**
     * Memperbarui detail profil pengguna.
     * @param {number} userId - ID pengguna.
     * @param {object} updateData - Data yang akan diperbarui (full_name, whatsapp_number).
     * @returns {object} - Data profil pengguna yang sudah diperbarui.
     */
    async updateUserProfile(userId, updateData) {
        const { full_name, whatsapp_number } = updateData;

        // Membangun query secara dinamis untuk memperbarui hanya kolom yang diberikan
        const fields =1;
        const values =1;
        let queryIndex = 1;

        if (full_name) {
            fields.push(`full_name = $${queryIndex++}`);
            values.push(full_name);
        }
        if (whatsapp_number) {
            fields.push(`whatsapp_number = $${queryIndex++}`);
            values.push(whatsapp_number);
        }

        if (fields.length === 0) {
            throw new ApiError(400, 'Tidak ada data yang dikirim untuk diperbarui.');
        }

        values.push(userId); // Tambahkan userId untuk klausa WHERE

        const query = `
            UPDATE phourto.users
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${queryIndex}
            RETURNING id, full_name, email, whatsapp_number
        `;

        const result = await db.query(query, values);
        return result.rows;
    }

    /**
     * Mengubah password pengguna.
     * @param {number} userId - ID pengguna.
     * @param {string} oldPassword - Password lama.
     * @param {string} newPassword - Password baru.
     */
    async changeUserPassword(userId, oldPassword, newPassword) {
        const userResult = await db.query('SELECT password FROM phourto.users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            throw new ApiError(404, 'Pengguna tidak ditemukan.');
        }

        const user = userResult.rows;
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new ApiError(401, 'Password lama yang Anda masukkan salah.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE phourto.users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    }

    /**
     * Menghapus akun pengguna.
     * @param {number} userId - ID pengguna.
     */
    async deleteUserAccount(userId) {
        const result = await db.query('DELETE FROM phourto.users WHERE id = $1', [userId]);
        if (result.rowCount === 0) {
            throw new ApiError(404, 'Pengguna tidak ditemukan.');
        }
    }
}

module.exports = new UserService();