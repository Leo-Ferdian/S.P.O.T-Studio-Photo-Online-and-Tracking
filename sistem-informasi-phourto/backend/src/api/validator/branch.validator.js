const { body, param } = require('express-validator');
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');

/**
 * Aturan validasi untuk parameter ID Cabang (UUID)
 * Digunakan oleh: GET /:id, PUT /:id, DELETE /:id
 */
const branchIdValidationRules = () => {
    return [
        param('id')
            .isUUID().withMessage('ID Cabang (Branch ID) harus berupa UUID yang valid.')
    ];
};

/**
 * Aturan validasi untuk body (data) Cabang
 * Digunakan oleh: POST /, PUT /:id
 */
const branchValidationRules = () => {
    return [
        // Validasi branch_name (Sesuai Skema V1.9)
        body('branch_name')
            .trim()
            .notEmpty().withMessage('Nama cabang tidak boleh kosong.')
            .isLength({ min: 3 }).withMessage('Nama cabang minimal 3 karakter.')
            // Cek kustom: Pastikan nama cabang unik (tidak boleh ada yang sama)
            .custom(async (value, { req }) => {
                const branchId = req.params.id; // Ambil ID dari URL (jika ada, untuk kasus UPDATE)
                
                let query;
                let params;

                if (branchId) {
                    // Kasus UPDATE: Cek apakah ada cabang LAIN (id != $2) yang punya nama ini
                    query = 'SELECT 1 FROM branches WHERE branch_name = $1 AND branch_id != $2';
                    params = [value, branchId];
                } else {
                    // Kasus CREATE: Cek apakah nama ini sudah ada
                    query = 'SELECT 1 FROM branches WHERE branch_name = $1';
                    params = [value];
                }

                const { rows } = await db.query(query, params);
                if (rows.length > 0) {
                    throw new ApiError(409, 'Nama cabang ini sudah terdaftar.');
                }
                return true;
            }),

        // Validasi address (Sesuai Skema V1.9)
        body('address')
            .trim()
            .notEmpty().withMessage('Alamat tidak boleh kosong.'),

        // Validasi open_hours (Sesuai Skema V1.9)
        body('open_hours')
            .trim()
            .notEmpty().withMessage('Jam buka tidak boleh kosong.')
            .matches(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/)
            .withMessage('Format jam buka harus HH:MM-HH:MM (contoh: 09:00-22:00)')
    ];
};

module.exports = {
    branchIdValidationRules,
    branchValidationRules
};