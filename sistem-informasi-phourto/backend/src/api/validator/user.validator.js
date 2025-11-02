const { body } = require('express-validator');

/**
 * Aturan validasi untuk [U]pdate Profil Pengguna
 * (Dipanggil oleh PUT /api/users/profile)
 */
const updateProfileValidationRules = () => {
    return [
        // Validasi full_name (Sesuai Skema V1.9)
        body('full_name')
            .trim()
            .notEmpty().withMessage('Nama lengkap tidak boleh kosong.')
            .isLength({ min: 3 }).withMessage('Nama lengkap minimal 3 karakter.'),

        // Validasi phone_number (Sesuai Skema V1.9)
        body('phone_number')
            .trim()
            .notEmpty().withMessage('Nomor HP tidak boleh kosong.')
            // FIX: Menggunakan regex yang toleran
            .isNumeric().withMessage('Nomor HP hanya boleh mengandung angka.')
            .isLength({ min: 10, max: 15 }).withMessage('Nomor HP harus antara 10 sampai 15 digit.'),
            
            // Catatan: Cek duplikasi (custom) Dihapus. Ini seharusnya ditangani di Service Layer.
    ];
};

/**
 * Aturan validasi untuk [C]hange Password
 * (Dipanggil oleh PATCH /api/users/password)
 */
const changePasswordValidationRules = () => {
    return [
        body('currentPassword')
            .notEmpty().withMessage('Password saat ini tidak boleh kosong.'),
        
        body('newPassword')
            .notEmpty().withMessage('Password baru tidak boleh kosong.')
            .isLength({ min: 8 }).withMessage('Password baru minimal 8 karakter.')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .withMessage('Password baru harus mengandung huruf besar, huruf kecil, angka, dan satu simbol.')
            .custom((value, { req }) => {
                if (value === req.body.currentPassword) {
                    throw new Error('Password baru tidak boleh sama dengan password saat ini.');
                }
                return true;
            }),

        body('confirmNewPassword')
            .notEmpty().withMessage('Konfirmasi password baru tidak boleh kosong.')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Konfirmasi password baru tidak cocok dengan password baru.');
                }
                return true;
            })
    ];
};

module.exports = {
    updateProfileValidationRules,
    changePasswordValidationRules
};