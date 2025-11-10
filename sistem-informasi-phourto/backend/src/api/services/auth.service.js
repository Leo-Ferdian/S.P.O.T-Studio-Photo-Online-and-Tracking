const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');
const { USER_ROLES } = require('../../config/constants');
const crypto = require('crypto');
const EmailService = require('./email.service.js'); // <-- 1. IMPOR EMAIL SERVICE
const fs = require('fs'); // <-- 2. Impor File System (bawaan Node.js)
const path = require('path'); // <-- 3. Impor Path (bawaan Node.js)

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

        if (userResult.rows.length === 0) {
            logger.warn(`Percobaan login gagal: Email tidak ditemukan (${email})`);
            throw new ApiError(404, `Email tidak ditemukan: ${email}`);
        }

        const user = userResult.rows[0];

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            logger.warn(`Percobaan login gagal: Password salah untuk email (${email})`);
            throw new ApiError(401, 'Password salah.'); // 401 Unauthorized
        }

        // Buat Token JWT
        const payload = {
            user_id: user.user_id,
            role: user.role
        };

        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

        if (!secret) {
            logger.error("JWT_SECRET belum diatur di file .env!");
            throw new ApiError(500, "Konfigurasi autentikasi server bermasalah.");
        }

        const token = jwt.sign(payload, secret, { expiresIn });

        // Hapus password hash dari objek user
        delete user.password_hash;

        return { token, user };
    }

    /**
     * Mendapatkan profil pengguna.
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

    // --- FUNGSI INI SEKARANG DIPERBARUI ---
    /**
     * @function handleForgotPasswordRequest
     * @desc Membuat token, menyimpan ke DB, dan mengirim email asli.
     * @param {string} userId - UUID pengguna
     * @param {string} email - Email pengguna
     */
    async handleForgotPasswordRequest(userId, email) {
        try {
            // 1. Buat token acak (ini yang dikirim ke email)
            const resetToken = crypto.randomBytes(32).toString('hex');

            // 2. Buat HASH dari token (ini yang disimpan di DB)
            const hashedResetToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            // 3. Tetapkan waktu kedaluwarsa (15 menit)
            const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

            // 4. Simpan token HASH ke database
            await db.query(
                'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE user_id = $3',
                [hashedResetToken, resetTokenExpires, userId]
            );

            // 5. Buat URL reset
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetURL = `${frontendUrl}/reset-password?token=${resetToken}`;

            // 6. KIRIM EMAIL ASLI (MENGGANTIKAN SIMULASI LOG)
            logger.info(`Mencoba mengirim email reset password ke: ${email}`);

            // 7. Baca template HTML
            // (Pastikan file 'reset_password_template.html' ada di 'src/templates/')
            const templatePath = path.join(__dirname, '..', '..', 'templates', 'reset_password_template.html');
            let html = fs.readFileSync(templatePath, 'utf8');

            // 8. Ganti placeholder
            html = html.replace('{{RESET_URL}}', resetURL);

            const subject = 'Reset Password Akun Phourto Anda';
            const text = `Anda meminta reset password. Silakan klik link ini untuk melanjutkan: ${resetURL} (Link ini valid selama 15 menit.)`;

            // 9. Panggil EmailService
            await EmailService.sendEmail(email, subject, text, html);

            return true;

        } catch (error) {
            logger.error('Error in handleForgotPasswordRequest:', error);
            // Sembunyikan error dari pengguna untuk keamanan
        }
    }

    /**
     * @function resetPassword
     * @desc Memvalidasi token reset dan mengatur password baru.
     * @param {string} token - Token mentah dari URL
     * @param {string} newPassword - Password baru dari form
     */
    async resetPassword(token, newPassword) {
        try {
            // 1. Hash token yang masuk agar kita bisa mencarinya di DB
            const hashedToken = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            // 2. Cari pengguna berdasarkan token HASH dan pastikan belum kedaluwarsa
            const userResult = await db.query(
                `SELECT user_id FROM users 
                WHERE reset_token = $1 AND reset_token_expires > NOW()`,
                [hashedToken]
            );

            if (userResult.rows.length === 0) {
                logger.warn('Percobaan reset password gagal: Token tidak valid atau sudah kedaluwarsa.');
                throw new ApiError(400, 'Token reset password tidak valid atau sudah kedaluwarsa.');
            }

            const userId = userResult.rows[0].user_id;

            // 3. Hash password baru
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            // 4. Update password di DB dan HAPUS token reset
            await db.query(
                `UPDATE users 
                SET password_hash = $1, 
                reset_token = NULL, 
                reset_token_expires = NULL, 
                updated_at = CURRENT_TIMESTAMP 
                WHERE user_id = $2`,
                [hashedNewPassword, userId]
            );

            logger.info(`Password untuk user ${userId} telah berhasil direset.`);
            return true;

        } catch (error) {
            logger.error('Error in resetPassword service:', error);
            if (error instanceof ApiError) throw error; // Lempar ulang error 400/404
            throw new ApiError('Terjadi kesalahan internal saat mereset password.', 500);
        }
    }
}

module.exports = new AuthService();