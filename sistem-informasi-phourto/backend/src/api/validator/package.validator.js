const { body, param } = require('express-validator');

// Validasi untuk body (Create & Update)
const packageBodyValidationRules = () => {
    return [
        body('name')
            .notEmpty().withMessage('Nama paket tidak boleh kosong')
            .isString().withMessage('Nama paket harus berupa teks'),
        body('price')
            .notEmpty().withMessage('Harga tidak boleh kosong')
            .isFloat({ gt: 0 }).withMessage('Harga harus angka positif'),
        body('duration_minutes')
            .notEmpty().withMessage('Durasi tidak boleh kosong')
            .isInt({ gt: 0 }).withMessage('Durasi harus angka bulat positif'),
    ];
};

// Validasi untuk parameter ID (Get One, Update, Delete)
const packageIdValidationRules = () => {
    return [
        param('id').isInt().withMessage('ID paket harus berupa angka')
    ];
};

module.exports = {
    packageBodyValidationRules,
    packageIdValidationRules,
};