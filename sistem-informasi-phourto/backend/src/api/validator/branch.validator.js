const { param } = require('express-validator');

// Validasi untuk GET /branches/:id
const getBranchByIdValidationRules = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID cabang harus berupa angka positif.')
];

module.exports = {
    getBranchByIdValidationRules,
};
