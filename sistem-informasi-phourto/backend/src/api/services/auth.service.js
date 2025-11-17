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

        // Cek apakah user sudah ada TAPI BELUM VERIFIKASI
        // (Validator [cite: 1-100] hanya mengecek yang sudah terverifikasi)
        const existingUser = await db.query(
            'SELECT user_id, is_verified FROM users WHERE email = $1',
            [email]
        );

        // 1. Hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Buat OTP
        const otp = crypto.randomInt(100000, 999999).toString(); // 6 digit
        const hashedOtp = await bcrypt.hash(otp, salt); // Enkripsi OTP untuk DB
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Kedaluwarsa 10 menit

        let userId;

        if (existingUser.rows.length > 0 && !existingUser.rows[0].is_verified) {
            // --- KASUS A: PENGGUNA MENDAFTAR ULANG (EMAIL BELUM VERIFIKASI) ---
            // Kita perbarui data pengguna lama dengan info & OTP baru
            logger.info(`Pengguna belum terverifikasi mendaftar ulang: ${email}. Memperbarui OTP...`);
            const result = await db.query(
                `UPDATE users 
                SET verification_otp_hash = $1, 
                    verification_otp_expires = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE email = $3
                RETURNING user_id`,
                [hashedOtp, otpExpires, email]
            );
            userId = result.rows[0].user_id;

        } else if (existingUser.rows.length === 0) {
            // --- KASUS B: PENGGUNA BARU ---
            // Buat pengguna baru dengan is_verified = false
            logger.info(`Mendaftarkan pengguna baru: ${email}`);
            const newUserResult = await db.query(
                `INSERT INTO users (
                    full_name, phone_number, email, password_hash, "role", 
                    is_verified, verification_otp_hash, verification_otp_expires
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING user_id`,
                [
                    full_name, phone_number, email, hashedPassword, USER_ROLES.CUSTOMER,
                    false, hashedOtp, otpExpires // Set is_verified = false
                ]
            );
            userId = newUserResult.rows[0].user_id;
        } else {
            // (Ini seharusnya sudah ditangani oleh validator [cite: 1-100], tapi sebagai cadangan)
            throw new ApiError(409, 'Email ini sudah terdaftar dan terverifikasi.');
        }


        // 3. Kirim Email Verifikasi (OTP)
        logger.info(`Mengirim OTP Verifikasi ke ${email}...`);

        const subject = `Kode Verifikasi Phourto Anda: ${otp}`;
        const text = `Gunakan kode ini untuk memverifikasi akun Anda: ${otp}. Kode ini valid selama 10 menit.`;
        // (Kita bisa buat template HTML yang lebih bagus nanti)
        const templatePath = path.join(__dirname, '..', '..', 'templates', 'verify_email_template.html');
        let html;
        try {
            html = fs.readFileSync(templatePath, 'utf8');
        } catch (readError) {
            logger.error('KRITIS: Gagal membaca template email verifikasi!', readError);
            throw new ApiError(500, 'Gagal membaca template email.');
        }

        // 2. Ganti placeholder
        html = html.replace('{{OTP_CODE}}', otp);

        try {
            await EmailService.sendEmail(email, subject, text, html);
            logger.info(`Email OTP berhasil dikirim ke ${email}.`);
        } catch (emailError) {
            logger.error(`KRITIS: Gagal mengirim email OTP ke ${email}`, emailError);
            throw new ApiError(500, 'Gagal mengirim email verifikasi. Coba lagi nanti.');
        }

        return { message: 'Registrasi berhasil. Silakan cek email Anda untuk kode OTP.' };
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
     * @function verifyUserOtp
     * @desc Memverifikasi OTP registrasi dan mengaktifkan akun.
     * @param {string} email - Email pengguna
     * @param {string} otp - Kode OTP 6 digit
     */
    async verifyUserOtp(email, otp) {
        try {
            // 1. Cari pengguna berdasarkan email
            const userResult = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (userResult.rows.length === 0) {
                throw new ApiError(404, 'Email tidak terdaftar.');
            }

            const user = userResult.rows[0];

            // 2. Cek apakah sudah diverifikasi
            if (user.is_verified) {
                throw new ApiError(400, 'Akun ini sudah terverifikasi.');
            }

            // 3. Cek apakah OTP ada atau sudah kedaluwarsa
            if (!user.verification_otp_hash || !user.verification_otp_expires) {
                throw new ApiError(400, 'OTP tidak ditemukan. Silakan coba mendaftar lagi.');
            }
            if (new Date() > new Date(user.verification_otp_expires)) {
                throw new ApiError(400, 'Kode OTP telah kedaluwarsa. Silakan mendaftar lagi untuk mendapatkan kode baru.');
            }

            // 4. Verifikasi OTP (Bandingkan input dengan hash di DB)
            const isOtpMatch = await bcrypt.compare(otp, user.verification_otp_hash);

            if (!isOtpMatch) {
                logger.warn(`Verifikasi OTP gagal untuk ${email} (OTP salah)`);
                throw new ApiError(400, 'Kode OTP salah.');
            }

            // 5. Sukses! Update pengguna menjadi terverifikasi
            await db.query(
                `UPDATE users 
                SET is_verified = true, 
                    verification_otp_hash = NULL, 
                    verification_otp_expires = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1`,
                [user.user_id]
            );

            logger.info(`Akun ${email} (User ID: ${user.user_id}) berhasil diverifikasi.`);
            return true;

        } catch (error) {
            logger.error('Error in verifyUserOtp:', error);
            if (error instanceof ApiError) throw error; // Lempar ulang error 400/404
            throw new ApiError('Terjadi kesalahan internal saat memverifikasi OTP.', 500);
        }
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