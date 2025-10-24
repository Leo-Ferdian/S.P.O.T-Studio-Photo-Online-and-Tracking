// src/api/services/user.services.js
const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const apiError = require('../../utils/apiError');

class UserService {
    async getUserProfileById(userId) {
        const result = await db.query(
            'SELECT id, full_name, email, whatsapp_number, created_at FROM phourto.users WHERE id = $1',
            [userId]
        );
        if (result.rows.length === 0) {
            throw new apiError ('Pengguna tidak ditemukan.', 404);
        }
        return result.rows[0];
    }

    /**
     * @param {object} updateData - Data dalam format camelCase: { fullName, whatsappNumber }
     */
    async updateUserProfile(userId, updateData) {
        // Terima data sebagai camelCase
        const { fullName, whatsappNumber } = updateData;

        // Perbaiki inisialisasi array
        const fields = []; 
        const values = []; 
        let queryIndex = 1;

        // Lakukan "penerjemahan" di sini
        if (fullName) {
            fields.push(`full_name = $${queryIndex++}`); // -> snake_case
            values.push(fullName);
        }
        if (whatsappNumber) {
            fields.push(`whatsapp_number = $${queryIndex++}`); // -> snake_case
            values.push(whatsappNumber);
        }

        if (fields.length === 0) {
            throw new apiError (400, 'Tidak ada data yang dikirim untuk diperbarui.');
        }

        values.push(userId); 

        const query = `
            UPDATE phourto.users
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${queryIndex}
            RETURNING id, full_name, email, whatsapp_number
        `;

        const result = await db.query(query, values);
        return result.rows[0]; // Kembalikan objek
    }

    /**
     * @param {string} oldPassword - Password lama (camelCase)
     * @param {string} newPassword - Password baru (camelCase)
     */
    async changeUserPassword(userId, oldPassword, newPassword) {
        const userResult = await db.query('SELECT password FROM phourto.users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            throw new apiError (404, 'Pengguna tidak ditemukan.');
        }

        const user = userResult.rows[0]; // Ambil objek

        // Gunakan parameter camelCase
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new apiError (401, 'Password lama yang Anda masukkan salah.');
        }

        const salt = await bcrypt.genSalt(10);
        // Gunakan parameter camelCase
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE phourto.users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, userId]);
    }

    // (Fungsi ini sudah benar, tidak perlu diubah)
    async deleteUserAccount(userId) {
        const result = await db.query('DELETE FROM phourto.users WHERE id = $1', [userId]);
        if (result.rowCount === 0) {
            throw new apiError (404, 'Pengguna tidak ditemukan.');
        }
    }
}

module.exports = new UserService();