const { body } = require('express-validator');

const updateProfileValidationRules = () => {
    return [
        body('name')
            .notEmpty()
            .withMessage('Nama wajib diisi.'),
        body('email')
            .isEmail()
            .withMessage('Email tidak valid.'),
        body('phone')
            .optional()
            .isMobilePhone('id-ID')
            .withMessage('Nomor telepon tidak valid.'),
    ];
};

const changePasswordValidationRules = () => {
    return [
        body('old_password').notEmpty().withMessage('Password lama wajib diisi.'),
        body('new_password')
            .notEmpty().withMessage('Password baru wajib diisi.')
            .isLength({ min: 8 }).withMessage('Password baru minimal 8 karakter.')
            .matches(/[A-Za-z]/).withMessage('Password baru harus mengandung huruf.')
            .matches(/[0-9]/).withMessage('Password baru harus mengandung angka.'),
        body('confirm_password')
            .notEmpty().withMessage('Konfirmasi password baru wajib diisi.')
            .custom((value, { req }) => {
                if (value !== req.body.new_password) {
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