const { param } = require('express-validator');
const db = require('../../../config/database');
const ApiError = require('../../../utils/apiError');
const { BOOKING_STATUS } = require('../../../config/constants');

/**
 * Aturan validasi untuk [C]reate (Upload) Foto oleh Admin
 * (Dipanggil oleh POST /api/admin/photos/upload/:bookingId)
 */
const uploadPhotoValidationRules = () => {
    return [
        param('bookingId')
            .isUUID().withMessage('ID Pesanan (Booking ID) harus berupa UUID yang valid.')
            .custom(async (value) => {
                // Periksa apakah booking ada dan dalam status yang valid
                const result = await db.query(
                    "SELECT payment_status FROM bookings WHERE booking_id = $1",
                    [value]
                );

                if (result.rows.length === 0) {
                    throw new ApiError(404, `Pesanan (Booking) dengan ID ${value} tidak ditemukan.`);
                }

                const status = result.rows[0].payment_status;

                // Tentukan status yang valid untuk upload foto
                // Admin hanya boleh meng-upload jika sudah dibayar (DP atau Lunas)
                // dan belum selesai (COMPLETED).
                const validStatusesForUpload = [
                    BOOKING_STATUS.PAID_DP,
                    BOOKING_STATUS.PAID_FULL
                ];

                if (!validStatusesForUpload.includes(status)) {
                    throw new ApiError(400, `Upload foto gagal. Status pesanan saat ini adalah '${status}', bukan 'PAID-DP' atau 'PAID-FULL'.`);
                }

                // Lolos validasi
                return true;
            })
    ];
};

module.exports = {
    uploadPhotoValidationRules
};