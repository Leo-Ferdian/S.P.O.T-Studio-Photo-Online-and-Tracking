const { body, param } = require('express-validator');
const { USER_ROLES } = require('../../../config/constants');
const db = require('../../../config/database');
const ApiError = require('../../../utils/apiError');

/**
 * Aturan validasi untuk parameter ID Pengguna (UUID)
 * (Digunakan oleh GET /:id, PUT /:id/role, DELETE /:id)
 */
const userIdParamValidationRules = () => {
    return [
        param('userId')
            .isUUID().withMessage('ID Pengguna (User ID) harus berupa UUID yang valid.')
            .custom(async (value) => {
                // Opsional: Cek apakah user ada.
                // Service V1.9 kita sudah menangani ini (error 404),
                // tetapi validasi di sini bisa menghemat query jika ID-nya salah format.
                // Untuk saat ini, kita hanya cek format UUID.
                return true;
            })
    ];
};

/**
 * Aturan validasi untuk [U]pdate Role oleh Admin
 * (Dipanggil oleh PUT /api/admin/users/:id/role)
 */
const updateUserRoleValidationRules = () => {
    return [
        // Validasi ID di URL
        param('userId').isUUID().withMessage('ID Pengguna (User ID) harus berupa UUID.'),

        // Validasi body request
        body('role')
            .notEmpty().withMessage('Peran (role) tidak boleh kosong.')
            .isString().withMessage('Peran (role) harus berupa teks.')
            .toLowerCase()
            .isIn(Object.values(USER_ROLES)) // Validasi terhadap konstanta
            .withMessage(`Peran (role) tidak valid. Harus salah satu dari: ${Object.values(USER_ROLES).join(', ')}`)
    ];
};

/**
 * Aturan validasi untuk [U]pdate Profile oleh Admin
 * (Dipanggil oleh PUT /api/admin/users/:userId/profile)
 */
const updateUserProfileValidationRules = () => {
    return [
        // 1. Validasi ID di URL
        param('userId').isUUID().withMessage('ID Pengguna (User ID) harus berupa UUID.'),

        // 2. Validasi body: full_name
        body('full_name')
            .notEmpty().withMessage('Nama lengkap tidak boleh kosong.')
            .isString().withMessage('Nama lengkap harus berupa teks.')
            .trim()
            .isLength({ min: 3 }).withMessage('Nama lengkap minimal 3 karakter.'),

        // 3. Validasi body: email
        body('email')
            .notEmpty().withMessage('Email tidak boleh kosong.')
            .isEmail().withMessage('Format email tidak valid.')
            .normalizeEmail()
            .custom(async (value, { req }) => {
                // Cek apakah email ini sudah dipakai oleh PENGGUNA LAIN
                const { userId } = req.params;
                try {
                    const result = await db.query(
                        'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
                        [value, userId]
                    );
                    if (result.rows.length > 0) {
                        // Jika email sudah ada, lempar error
                        throw new Error('Email ini sudah terdaftar oleh pengguna lain.');
                    }
                    return true;
                } catch (error) {
                    // Handle potential DB errors during validation
                    throw new Error('Gagal memvalidasi email di database.');
                }
            }),

        // 4. Validasi body: phone_number
        body('phone_number')
            .notEmpty().withMessage('Nomor telepon tidak boleh kosong.')
            .isString().withMessage('Nomor telepon harus berupa teks.')
            .trim()
            // Anda bisa tambahkan .isMobilePhone('id-ID') jika Anda menginstal 'validator' npm
            .isLength({ min: 10, max: 15 }).withMessage('Nomor telepon harus antara 10 dan 15 digit.')
    ];
};

module.exports = {
    userIdParamValidationRules,
    updateUserRoleValidationRules,
    updateUserProfileValidationRules
};
