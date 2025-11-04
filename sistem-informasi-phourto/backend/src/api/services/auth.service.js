const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger'); 
// const { v4: uuidv4 } = require('uuid'); // (Tidak digunakan di file ini)

// Impor dari file V1.9 yang kita buat di Langkah 10f
const { USER_ROLES } = require('../../config/constants'); 

class AuthService {
    /**
     * Mendaftarkan pengguna baru.
     * (Refactored V1.9)
     */
    async registerUser({ full_name, phone_number, email, password }) {
        // Cek duplikasi email ATAU nomor telepon
        const existingUser = await db.query(
            'SELECT email, phone_number FROM users WHERE email = $1 OR phone_number = $2',
            [email, phone_number]
        );

        if (existingUser.rows.length > 0) {
            const conflictingField = existingUser.rows[0].email === email ? 'Email' : 'Nomor Telepon';
            throw new ApiError(409, `${conflictingField} sudah terdaftar.`);
        }

        // Hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan pengguna baru
        const newUserResult = await db.query(
            `INSERT INTO users (full_name, phone_number, email, password_hash, "role") 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING user_id, full_name, email, "role", created_at`,
            [full_name, phone_number, email, hashedPassword, USER_ROLES.CUSTOMER]
        );

        if (newUserResult.rows.length === 0) {
            throw new ApiError(500, 'Gagal menyimpan pengguna baru ke database.');
        }

        return newUserResult.rows[0];
    }

    /**
     * Melakukan login pengguna.
     * (Refactored V1.9 + V1.7 Debugging)
     */
    async loginUser(email, password) {
        // Cari pengguna berdasarkan email
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        // === PERBAIKAN V1.7 (DEBUGGING) ===
        if (userResult.rows.length === 0) {
            // SPESIFIK: Email tidak ditemukan
            logger.warn(`Percobaan login gagal: Email tidak ditemukan (${email})`); // <-- Sekarang akan berfungsi
            throw new ApiError(404, `Email tidak ditemukan: ${email}`); 
        }
        // === AKHIR PERBAIKAN ===

        const user = userResult.rows[0];

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        // === PERBAIKAN V1.7 (DEBUGGING) ===
        if (!isMatch) {
            // SPESIFIK: Password salah
            logger.warn(`Percobaan login gagal: Password salah untuk email (${email})`); // <-- Sekarang akan berfungsi
            throw new ApiError(401, 'Password salah.'); // 401 Unauthorized
        }
        // === AKHIR PERBAIKAN ===

        // Buat Token JWT
        const payload = {
            user_id: user.user_id,
            role: user.role
        };

        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

        if (!secret) {
            logger.error("JWT_SECRET belum diatur di file .env!"); // .error() juga akan berfungsi
            throw new ApiError(500, "Konfigurasi autentikasi server bermasalah.");
        }

        const token = jwt.sign(payload, secret, { expiresIn });

        // Hapus password hash dari objek user
        delete user.password_hash;

        return { token, user };
    }

    /**
     * Mendapatkan profil pengguna.
     * (Refactored V1.9)
     */
    async getUserProfile(user_id) { 
        const result = await db.query(
            'SELECT user_id, full_name, email, phone_number, "role", created_at FROM users WHERE user_id = $1',
            [user_id]
        );
        if (result.rows.length === 0) {
            throw new ApiError(404, 'Profil pengguna tidak ditemukan.');
        }
        return result.rows[0];
    }

    /**
     * Mengupdate profil pengguna.
     * (Refactored V1.9)
     */
    async updateUserProfile(user_id, updateData) { 
        const { full_name, phone_number } = updateData;
        const result = await db.query(
            `UPDATE users SET full_name = $1, phone_number = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = $3 
            RETURNING user_id, full_name, email, phone_number, "role", updated_at`,
            [full_name, phone_number, user_id]
        );
        if (result.rows.length === 0) {
            throw new ApiError(404, 'Gagal memperbarui, profil pengguna tidak ditemukan.');
        }
        return result.rows[0];
    }

    /**
     * Mengganti password pengguna.
     * (Refactored V1.9)
     */
    async changeUserPassword(user_id, currentPassword, newPassword) { 
        const userResult = await db.query('SELECT password_hash FROM users WHERE user_id = $1', [user_id]);
        if (userResult.rows.length === 0) throw new ApiError(404, 'User tidak ditemukan.');

        const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
        if (!isMatch) throw new ApiError(400, 'Password saat ini salah.');

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [hashedNewPassword, user_id]);
    }
}

module.exports = new AuthService();