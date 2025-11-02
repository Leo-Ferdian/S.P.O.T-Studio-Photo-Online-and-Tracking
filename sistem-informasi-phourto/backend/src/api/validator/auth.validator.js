const { body } = require('express-validator');
const db = require('../../config/database'); // Koneksi DB V1.6
const ApiError = require('../../utils/apiError');

/**
 * Aturan validasi untuk registrasi pengguna baru
 */
const registerValidationRules = () => {
    return [
        // Validasi full_name (Sesuai Skema V1.9)
        body('full_name')
            .trim()
            .notEmpty().withMessage('Nama lengkap tidak boleh kosong.')
            .isLength({ min: 3 }).withMessage('Nama lengkap minimal 3 karakter.'),

        // Validasi email
        body('email')
            .trim()
            .notEmpty().withMessage('Email tidak boleh kosong.')
            .isEmail().withMessage('Format email tidak valid.')
            .normalizeEmail()
            // Cek kustom: Pastikan email belum terdaftar
            .custom(async (value) => {
                const { rows } = await db.query('SELECT 1 FROM users WHERE email = $1', [value]);
                if (rows.length > 0) {
                    // Gunakan ApiError agar ditangkap oleh asyncHandler
                    throw new ApiError(409, 'Email ini sudah terdaftar.');
                }
            }),

        // Validasi phone_number (Sesuai Skema V1.9)
        body('phone_number')
            .trim()
            .notEmpty().withMessage('Nomor HP tidak boleh kosong.')
            .isMobilePhone('id-ID').withMessage('Format nomor HP tidak valid (gunakan format Indonesia, cth: 08123456789).')
            // Cek kustom: Pastikan nomor HP belum terdaftar
            .custom(async (value) => {
                const { rows } = await db.query('SELECT 1 FROM users WHERE phone_number = $1', [value]);
                if (rows.length > 0) {
                    throw new ApiError(409, 'Nomor HP ini sudah terdaftar.');
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
            .normalizeEmail(),
        
        body('password')
            .notEmpty().withMessage('Password tidak boleh kosong.')
    ];
};


module.exports = {
    registerValidationRules,
    loginValidationRules
};