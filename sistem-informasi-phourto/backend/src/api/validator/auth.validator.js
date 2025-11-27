const { body } = require('express-validator');
const db = require('../../config/database'); // Koneksi DB V1.6
const ApiError = require('../../utils/apiError');
const { USER_ROLES } = require('../../config/constants'); // Diperlukan untuk register

/**
 * Aturan validasi untuk registrasi pengguna baru
 */
const registerValidationRules = () => {
    return [
        // Validasi full_name
        body('full_name')
            .trim()
            .notEmpty().withMessage('Nama lengkap tidak boleh kosong.')
            .isLength({ min: 3 }).withMessage('Nama lengkap minimal 3 karakter.'),

        // Validasi email
        body('email')
            .trim()
            .notEmpty().withMessage('Email tidak boleh kosong.')
            .isEmail().withMessage('Format email tidak valid.')
            .normalizeEmail({ gmail_remove_dots: false })
            .custom(async (value) => {
                // Hanya blokir jika email sudah ada DAN terverifikasi
                const { rows } = await db.query(
                    'SELECT 1 FROM users WHERE email = $1 AND is_verified = true',
                    [value]
                );
                if (rows.length > 0) {
                    throw new ApiError(409, 'Email ini sudah terdaftar dan terverifikasi.');
                }
            }),

        // Validasi phone_number
        body('phone_number')
            .trim()
            .notEmpty().withMessage('Nomor HP tidak boleh kosong.')
            .isMobilePhone('id-ID').withMessage('Format nomor HP tidak valid (cth: 08123456789).')
            .custom(async (value, { req }) => {
                // Cek apakah nomor HP ini digunakan oleh ORANG LAIN
                const { rows } = await db.query(
                    'SELECT 1 FROM users WHERE phone_number = $1 AND email != $2 AND is_verified = true',
                    [value, req.body.email] // Pastikan itu bukan milik akun (belum terverifikasi) pengguna ini
                );
                if (rows.length > 0) {
                    throw new ApiError(409, 'Nomor HP ini sudah terdaftar di akun lain.');
                }
            }),

        // Validasi password
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong.')
            .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .withMessage('Password harus mengandung huruf besar, huruf kecil, angka, dan satu simbol.'),

        // Validasi confirmPassword
        body('confirmPassword')
            .notEmpty().withMessage('Konfirmasi password tidak boleh kosong.')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Konfirmasi password tidak cocok dengan password.');
                }
                return true;
            })
    ];
};

/**
 * Aturan validasi untuk login pengguna
 */
const loginValidationRules = () => {
    return [
        body('email')
            .trim()
            .notEmpty().withMessage('Email tidak boleh kosong.')
            .isEmail().withMessage('Format email tidak valid.')
            .normalizeEmail({ gmail_remove_dots: false }),

        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong.')
    ];
};

// --- FUNGSI BARU DITAMBAHKAN DI SINI ---
/**
 * Aturan validasi untuk Lupa Password
 * (Dipanggil oleh POST /api/auth/forgot-password)
 */
const forgotPasswordValidationRules = () => {
    return [
        body('email')
            .trim()
            .notEmpty().withMessage('Email tidak boleh kosong.')
            .isEmail().withMessage('Format email tidak valid.')
            .normalizeEmail({ gmail_remove_dots: false })
            .custom(async (value, { req }) => {
                // --- PERBAIKAN LOGIKA DI SINI ---
                // Cek kustom: Pastikan email INI ADA
                const { rows } = await db.query('SELECT user_id FROM users WHERE email = $1', [value]);

                if (rows.length === 0) {
                    // Gagal: Lempar error 404
                    throw new ApiError(404, 'Email tidak terdaftar.');
                }

                // Sukses: Lampirkan user_id ke request
                req.foundUserId = rows[0].user_id;
                return true;
            })
    ];
};

/**
 * Aturan validasi untuk Reset Password
 * (Dipanggil oleh POST /api/auth/reset-password)
 */
const resetPasswordValidationRules = () => {
    return [
        // 1. Validasi Token (dari body)
        body('token')
            .trim()
            .notEmpty().withMessage('Token tidak boleh kosong.'),
        // (Pengecekan token ke DB akan dilakukan di service)

        // 2. Validasi Password Baru (salin dari 'register')
        body('newPassword')
            .notEmpty().withMessage('Password baru tidak boleh kosong.')
            .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .withMessage('Password harus mengandung huruf besar, huruf kecil, angka, dan satu simbol.'),

        // 3. Validasi Konfirmasi Password
        body('confirmPassword')
            .notEmpty().withMessage('Konfirmasi password tidak boleh kosong.')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Konfirmasi password tidak cocok dengan password baru.');
                }
                return true;
            })
    ];
};

/**
 * Aturan validasi untuk Verifikasi OTP
 * (Dipanggil oleh POST /api/auth/verify-otp)
 */
const verifyOtpValidationRules = () => {
    return [
        // 1. Validasi Email
        body('email')
            .trim()
            .notEmpty().withMessage('Email tidak boleh kosong.')
            .isEmail().withMessage('Format email tidak valid.')
            .normalizeEmail({ gmail_remove_dots: false }),

        // 2. Validasi OTP
        body('otp')
            .trim()
            .notEmpty().withMessage('Kode OTP tidak boleh kosong.')
            .isString().withMessage('OTP harus berupa string.')
            .isLength({ min: 6, max: 6 }).withMessage('Kode OTP harus 6 digit.')
            .isNumeric().withMessage('Kode OTP harus berupa angka.')
    ];
};

module.exports = {
    registerValidationRules,
    loginValidationRules,
    forgotPasswordValidationRules,
    resetPasswordValidationRules,
    verifyOtpValidationRules
};