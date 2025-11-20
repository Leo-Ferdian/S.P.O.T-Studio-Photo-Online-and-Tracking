const { query, param } = require('express-validator');
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const { BOOKING_STATUS } = require('../../config/constants');
const { logger } = require('../../utils/logger');

const claimPhotoValidationRules = () => {
    return [
        // 1. Validasi Kode Booking (DARI URL PARAMETER)
        // Contoh URL: /api/photos/PHR-12345/gallery
        // 'bookingId' di sini akan berisi "PHR-12345"
        param('bookingId')
            .trim()
            .notEmpty().withMessage('Kode Booking (URL Param) wajib ada.'),

        // 2. Validasi Email (DARI QUERY PARAMETER)
        // Contoh URL: ...?email=user@example.com
        query('email')
            .trim()
            .notEmpty().withMessage('Email wajib ada di query parameter.')
            .isEmail().withMessage('Format email tidak valid.'),

        // 3. Validasi Logika Bisnis (Cek DB)
        param('bookingId').custom(async (bookingCode, { req }) => {
            const customerEmail = req.query.email;

            // Jika email formatnya salah/kosong, skip validasi DB ini (biar error validator email yg muncul)
            if (!customerEmail) return;

            try {
                // A. Cari booking berdasarkan UNIQUE CODE
                const bookingResult = await db.query(
                    'SELECT user_id, booking_id, payment_status FROM bookings WHERE unique_code = $1',
                    [bookingCode]
                );

                if (bookingResult.rows.length === 0) {
                    throw new ApiError(404, 'Kode Booking tidak ditemukan.');
                }

                const booking = bookingResult.rows[0];

                // B. Cek Status Booking (Harus Lunas/Selesai)
                const validStatus = [BOOKING_STATUS.PAID_FULL, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.DELIVERED];
                if (!validStatus.includes(booking.payment_status)) {
                    throw new ApiError(403, `Booking belum selesai (Status: ${booking.payment_status}).`);
                }

                // C. Cari User berdasarkan Email
                const userResult = await db.query(
                    'SELECT user_id FROM users WHERE email = $1',
                    [customerEmail]
                );

                if (userResult.rows.length === 0) {
                    throw new ApiError(403, 'Email tidak terdaftar.');
                }

                const customerUserId = userResult.rows[0].user_id;

                // D. Verifikasi Kepemilikan
                if (booking.user_id !== customerUserId) {
                    throw new ApiError(403, 'Email ini tidak sesuai dengan data pemesan.');
                }

                // E. SUKSES: Simpan ID internal ke Request object
                // Ini penting agar Controller tidak perlu query ulang
                req.verifiedBookingId = booking.booking_id; // UUID
                req.verifiedUserId = customerUserId;        // UUID

                return true;

            } catch (error) {
                // Lempar error API spesifik jika ada, atau error umum
                if (error instanceof ApiError) throw error;

                logger.error('Validator Error (claimPhoto):', error);
                throw new ApiError(500, 'Gagal memvalidasi data booking.');
            }
        })
    ];
};

module.exports = {
    claimPhotoValidationRules
};