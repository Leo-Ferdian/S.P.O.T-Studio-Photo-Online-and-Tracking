const { body } = require('express-validator');

// Validasi input untuk membuat booking baru
const createBookingValidationRules = () => {
    return [
        body('package_id')
            .notEmpty().withMessage('package_id wajib diisi.')
            .isInt({ gt: 0 }).withMessage('package_id harus berupa angka positif.'),

        body('branch_id')
            .notEmpty().withMessage('branch_id wajib diisi.')
            .isInt({ gt: 0 }).withMessage('branch_id harus berupa angka positif.'),

        body('booking_time')
            .notEmpty().withMessage('booking_time wajib diisi.')
            .isISO8601().withMessage('booking_time harus dalam format tanggal valid (ISO 8601).')
            .custom((value) => {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error('booking_time tidak valid.');
                }
                return true;
            })
    ];
};

module.exports = {
    createBookingValidationRules,
};
