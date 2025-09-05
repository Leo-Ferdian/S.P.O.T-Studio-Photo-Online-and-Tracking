const { body } = require('express-validator');

const registerValidationRules = () => {
    return/).withMessage('Password harus mengandung huruf.'),
    ];
};

const loginValidationRules = () => {
    return [
        body('email')
           .notEmpty().withMessage('Email wajib diisi.')
           .isEmail().withMessage('Format email tidak valid.'),
        body('password').notEmpty().withMessage('Password wajib diisi.'),
    ];
};

module.exports = {
    registerValidationRules,
    loginValidationRules,
};