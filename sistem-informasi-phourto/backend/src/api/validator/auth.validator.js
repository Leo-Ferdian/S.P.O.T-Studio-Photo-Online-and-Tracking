const { body } = require('express-validator');

const registerValidationRules = () => {
    return [
        body('full_name')
            .notEmpty().withMessage('Nama wajib diisi.')
            .isLength({ min: 3, max: 20}).withMessage('Nama harus antara 3 hingga 20 karakter.')
            .matches(/^[A-Za-z\s]+$/).withMessage('Nama hanya boleh mengandung huruf dan spasi.')
            .trim(),
        body('email')
            .notEmpty().withMessage('Email wajib diisi.')
            .isEmail().withMessage('Format email tidak valid.')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password wajib diisi.')
            .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.')
            .matches(/[A-Za-z]/).withMessage('Password harus mengandung huruf.')
            .matches(/[0-9]/).withMessage('Password harus mengandung angka.'),
        body('confirm_password')
            .notEmpty().withMessage('Konfirmasi password wajib diisi.')
            .custom((value, { req }) => {
                if (value!== req.body.password) {
                    throw new Error('Konfirmasi password tidak cocok dengan password.');
                }
                return true;
                }),
        body('whatsapp_number')
            .notEmpty().withMessage('Nomor WhatsApp wajib diisi.')
            .isMobilePhone('id-ID').withMessage('Format nomor WhatsApp tidak valid.')
            .isLength({ min: 10, max: 15 }).withMessage('Nomor WhatsApp harus antara 10 hingga 15 digit.')
    ];
};

function loginValidationRules() {
    return [
        // Validasi email: tidak boleh kosong dan format email
        body('email')
            .notEmpty().withMessage('Email wajib diisi.')
            .isEmail().withMessage('Format email tidak valid.'),

        // Validasi password: tidak boleh kosong
        body('password').notEmpty().withMessage('Password wajib diisi.')
    ];
}

module.exports = {
    registerValidationRules,
    loginValidationRules,
};