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

module.exports = {
    userIdParamValidationRules,
    updateUserRoleValidationRules
};
