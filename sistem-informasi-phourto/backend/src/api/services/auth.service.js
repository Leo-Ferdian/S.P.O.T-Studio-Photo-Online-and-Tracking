const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Hapus require('dotenv').config(); di sini, idealnya sudah dipanggil di file utama (server.js)
const ApiError = require('../../utils/apiError'); // Pastikan path benar dan 'A' besar
const logger = require('../../utils/logger'); // Impor logger untuk debugging

class AuthService {
    /**
     * Mendaftarkan pengguna baru.
     */
    async registerUser({ full_name, whatsapp_number, email, password }) {
        // Cek duplikasi email ATAU nomor whatsapp
        const existingUser = await db.query(
            'SELECT email, whatsapp_number FROM phourto.users WHERE email = $1 OR whatsapp_number = $2',
            [email, whatsapp_number]
        );

        if (existingUser.rows.length > 0) {
            // Berikan pesan error yang lebih spesifik
            const conflictingField = existingUser.rows[0].email === email ? 'Email' : 'Nomor WhatsApp';
            throw new ApiError(409, `${conflictingField} sudah terdaftar.`); // 409 Conflict
        }

        // Hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        logger.debug("Hashed Password for registration:", hashedPassword); // Gunakan logger

        // Simpan pengguna baru, pastikan kolom 'role' ada default 'customer' di DB atau set di sini
        const newUserResult = await db.query(
            `INSERT INTO phourto.users (full_name, whatsapp_number, email, password) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, full_name, email, role, created_at`, // Kembalikan data yang relevan
            [full_name, whatsapp_number, email, hashedPassword]
        );

        if (newUserResult.rows.length === 0) {
            throw new ApiError(500, 'Gagal menyimpan pengguna baru ke database.');
        }

        return newUserResult.rows[0]; // Kembalikan objek user baru
    }

    /**
     * Melakukan login pengguna.
     */
    async loginUser(email, password) { // Terima parameter terpisah, bukan objek
        // Cari pengguna berdasarkan email
        const userResult = await db.query('SELECT * FROM phourto.users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            // Email tidak ditemukan
            throw new ApiError(401, 'Email atau password salah.'); // 401 Unauthorized
        }

        const user = userResult.rows[0];

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Password tidak cocok
            throw new ApiError(401, 'Email atau password salah.'); // 401 Unauthorized
        }

        // Buat Token JWT dengan payload yang relevan
        const payload = {
            id: user.id,
            role: user.role // SANGAT PENTING: sertakan role untuk otorisasi admin
        };

        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '1d'; // Ambil dari .env atau default 1 hari

        if (!secret) {
            logger.error("JWT_SECRET belum diatur di file .env!");
            throw new ApiError(500, "Konfigurasi autentikasi server bermasalah.");
        }

        const token = jwt.sign(payload, secret, { expiresIn });

        // Hapus password dari objek user sebelum dikirim ke client
        delete user.password;

        // Kembalikan token dan data user (tanpa password)
        return { token, user };
    }

    // --- Fungsi Tambahan yang Mungkin Ada (dari controller) ---

    async checkAvailability(username, email) {
        // Implementasi logika cek ketersediaan (jika diperlukan)
        // ...
        return true; // Placeholder
    }

    async getUserProfile(userId) {
        const result = await db.query('SELECT id, full_name, email, whatsapp_number, role, created_at FROM phourto.users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            throw new ApiError(404, 'Profil pengguna tidak ditemukan.');
        }
        return result.rows[0];
    }

    async updateUserProfile(userId, updateData) {
        // Implementasi logika update profil (hati-hati jangan update password di sini)
        const { full_name, whatsapp_number } = updateData; // Ambil field yang boleh diupdate
        const result = await db.query(
            `UPDATE phourto.users SET full_name = $1, whatsapp_number = $2, updated_at = CURRENT_TIMESTAMP 
              WHERE id = $3 RETURNING id, full_name, email, whatsapp_number, role, updated_at`,
            [full_name, whatsapp_number, userId]
        );
        if (result.rows.length === 0) {
            throw new ApiError(404, 'Gagal memperbarui, profil pengguna tidak ditemukan.');
        }
        return result.rows[0];
    }

    async changeUserPassword(userId, currentPassword, newPassword) {
        const userResult = await db.query('SELECT password FROM phourto.users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) throw new ApiError(404, 'User tidak ditemukan.');

        const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password);
        if (!isMatch) throw new ApiError(400, 'Password saat ini salah.');

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE phourto.users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedNewPassword, userId]);
    }

}

module.exports = new AuthService();