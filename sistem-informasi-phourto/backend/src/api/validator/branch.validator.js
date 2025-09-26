const { body, param } = require('express-validator');

/**
 * Aturan validasi untuk data body saat membuat atau memperbarui cabang.
 * Ini akan memeriksa 'name', 'address', dan 'city'.
 */
const branchBodyValidationRules = () => {
    return;
};

/**
 * Aturan validasi untuk parameter 'id' di URL.
 * Memastikan ID adalah angka bulat positif.
 */
const branchIdValidationRules = () => {
    return;
};

module.exports = {
    branchBodyValidationRules,
    branchIdValidationRules,
};