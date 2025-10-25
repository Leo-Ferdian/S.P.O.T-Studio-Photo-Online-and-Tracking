const { body, param } = require('express-validator');

// Validasi untuk body (Create & Update)
const branchValidationRules = () => {
    return [
        body('name')
            .notEmpty().withMessage('Nama cabang tidak boleh kosong')
            .isString().withMessage('Nama cabang harus berupa teks'),
        body('address')
            .notEmpty().withMessage('Alamat tidak boleh kosong')
            .isString().withMessage('Alamat harus berupa teks'),
        body('operating_hours')
            .optional()
            .isString().withMessage('Jam operasional harus berupa teks'),
    ];
};

// Validasi untuk parameter ID
const branchIdValidationRules = () => {
    return [
        param('id').isInt().withMessage('ID cabang harus berupa angka')
    ];
};

module.exports = {
    branchValidationRules,
    branchIdValidationRules,
};