// api/validator/photo.validator.js
const { body, query, param } = require('express-validator'); // 1. Impor 'query'
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const { BOOKING_STATUS } = require('../../config/constants');
const { logger } = require('../../utils/logger');

/**
 * ATURAN BARU (Menggantikan getGalleryValidationRules)
 * * Aturan validasi untuk alur KLAIM FOTO PUBLIK
 * Ini memeriksa query params: 'code' (unik) dan 'email'
 * dan memverifikasi bahwa keduanya cocok.
 */
const claimPhotoValidationRules = () => {
    return [
        // 1. Validasi Kode Booking (dari query string)
        query('code')
            .trim()
            .notEmpty().withMessage('Kode Booking (code) wajib ada di query parameter.'),

        // 2. Validasi Email (dari query string)
        query('email')
            .trim()
            .notEmpty().withMessage('Email (email) wajib ada di query parameter.')
            .isEmail().withMessage('Format email tidak valid.'),

        // 3. Validasi Keamanan (Kroscek DB)
        query('code').custom(async (bookingCode, { req }) => {
            const customerEmail = req.query.email;
            if (!customerEmail) return; // Biarkan validator email yang menangani error 'kosong'

            try {
                // Cari booking berdasarkan KODE UNIK
                const bookingResult = await db.query(
                    'SELECT user_id, booking_id, payment_status FROM bookings WHERE unique_code = $1',
                    [bookingCode]
                );

                if (bookingResult.rows.length === 0) {
                    throw new ApiError(404, 'Kode Booking tidak ditemukan.');
                }

                const booking = bookingResult.rows[0];

                // Cek status. Pelanggan hanya boleh klaim jika sudah Lunas atau Selesai
                const validStatus = [BOOKING_STATUS.PAID_FULL, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.DELIVERED];
                if (!validStatus.includes(booking.payment_status)) {
                    throw new ApiError(403, `Tidak bisa klaim foto. Status booking Anda saat ini: ${booking.payment_status}.`);
                }

                // Cari user berdasarkan EMAIL
                const userResult = await db.query(
                    'SELECT user_id FROM users WHERE email = $1',
                    [customerEmail]
                );

                if (userResult.rows.length === 0) {
                    throw new ApiError(403, 'Email tidak terdaftar.');
                }

                const customerUserId = userResult.rows[0].user_id;

                // Bandingkan!
                if (booking.user_id !== customerUserId) {
                    throw new ApiError(403, 'Akses ditolak. Email dan Kode Booking tidak cocok.');
                }

                // 4. Lampirkan data yang sudah terverifikasi ke 'req'
                //    agar Controller bisa menggunakannya
                req.verifiedBookingId = booking.booking_id;
                req.verifiedUserId = customerUserId;

                return true;

            } catch (error) {
                if (error instanceof ApiError) throw error;
                logger.error('DB Error (claimPhotoValidationRules):', error);
                throw new ApiError('Gagal memvalidasi kepemilikan booking.', 500);
            }
        })
    ];
};

module.exports = {
    claimPhotoValidationRules // 5. Ekspor aturan baru
};