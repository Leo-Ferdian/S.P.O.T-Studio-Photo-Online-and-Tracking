const { param } = require('express-validator');
const db = require('../../../config/database');
const ApiError = require('../../../utils/apiError');
const { BOOKING_STATUS } = require('../../../config/constants');

/**
 * @function uploadPhotoValidationRules
 * @desc Aturan validasi untuk [C]reate (Upload) Foto oleh Admin
 * Digunakan pada: POST /api/admin/photos/upload/:bookingId
 */
const uploadPhotoValidationRules = () => [
    param('bookingId')
        .isUUID()
        .withMessage('ID Pesanan (Booking ID) harus berupa UUID yang valid.')
        .custom(async (value) => {
            // Periksa apakah booking ada dan statusnya valid untuk upload foto
            const result = await db.query(
                'SELECT payment_status FROM bookings WHERE booking_id = $1',
                [value]
            );

            // Validasi keberadaan booking
            if (result.rows.length === 0) {
                throw new ApiError(404, `Pesanan (Booking) dengan ID ${value} tidak ditemukan.`);
            }

            const status = result.rows[0].payment_status;
            const validStatusesForUpload = [
                BOOKING_STATUS.PAID_DP,
                BOOKING_STATUS.PAID_FULL
            ];

            // Validasi status booking
            if (!validStatusesForUpload.includes(status)) {
                throw new ApiError(
                    400,
                    `Upload foto gagal. Status pesanan saat ini adalah '${status}', bukan 'PAID-DP' atau 'PAID-FULL'.`
                );
            }

            return true;
        })
];

/**
 * @function bookingIdParamValidationRules
 * @desc Aturan validasi untuk parameter bookingId (UUID)
 * Digunakan pada: GET /api/admin/photos/:bookingId
 */
const bookingIdParamValidationRules = () => [
    param('bookingId')
        .isUUID()
        .withMessage('ID Pesanan (Booking ID) harus berupa UUID yang valid.')
];

module.exports = {
    uploadPhotoValidationRules,
    bookingIdParamValidationRules
};