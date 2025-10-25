// src/api/validator/user.validator.js
const { body } = require('express-validator');

const updateProfileValidationRules = () => {
    return [
        body('fullName')
            .optional()
            .isString()
            .withMessage('Nama lengkap harus berupa teks')
            .isLength({ min: 3 })
            .withMessage('Nama lengkap minimal 3 karakter'),

        body('whatsappNumber')
            .optional()
            .isMobilePhone('id-ID')
            .withMessage('Format nomor WhatsApp tidak valid (contoh: +628... atau 08...)'),
    ];
};

const changePasswordValidationRules = () => {
    return [
        body('oldPassword').notEmpty().withMessage('Password lama wajib diisi.'),
        
        body('newPassword')
            .notEmpty().withMessage('Password baru wajib diisi.')
            .isLength({ min: 8 }).withMessage('Password baru minimal 8 karakter.')
            .matches(/[A-Za-z]/).withMessage('Password baru harus mengandung huruf.')
            .matches(/[0-9]/).withMessage('Password baru harus mengandung angka.'),
            
        body('confirmPassword')
            .notEmpty().withMessage('Konfirmasi password baru wajib diisi.')
            .custom((value, { req }) => {
                // Periksa terhadap newPassword (camelCase)
                if (value !== req.body.newPassword) {
                    throw new Error('Konfirmasi password tidak cocok dengan password baru.');
                }
                return true;
            })
    ];
};

module.exports = {
    updateProfileValidationRules,
    changePasswordValidationRules,
};