const { body, param } = require('express-validator');

/**
 * Aturan validasi untuk data body saat membuat atau memperbarui paket.
 */
const packageBodyValidationRules = () => {
    return;
};

/**
 * Aturan validasi untuk parameter 'id' di URL.
 */
const packageIdValidationRules = () => {
    return;
};

module.exports = {
    packageBodyValidationRules,
    packageIdValidationRules,
};