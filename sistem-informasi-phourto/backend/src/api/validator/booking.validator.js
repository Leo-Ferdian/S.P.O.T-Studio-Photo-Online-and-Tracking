const { body, param, query } = require('express-validator');
const db = require('../../config/database'); // Koneksi DB V1.9
const ApiError = require('../../utils/apiError');
const { BOOKING_STATUS, USER_ROLES } = require('../../config/constants'); // (Kita akan buat file constants ini)

// =================================================================
// ATURAN UNTUK PELANGGAN (CUSTOMER)
// =================================================================

/**
 * Aturan validasi untuk [C]reate Booking
 * (Dipanggil oleh POST /api/bookings)
 */
const createBookingValidationRules = () => {
    return [
        body('package_id')
            .trim()
            .notEmpty().withMessage('ID Paket (package_id) tidak boleh kosong.')
            .isUUID().withMessage('ID Paket (package_id) harus berupa UUID.')
            .custom(async (value) => {
                // Cek apakah paket ada dan ambil harganya
                const { rows } = await db.query('SELECT 1 FROM packages WHERE package_id = $1', [value]);
                if (rows.length === 0) {
                    throw new ApiError(404, 'Paket dengan ID ini tidak ditemukan.');
                }
            }),

        body('start_time')
            .trim()
            .notEmpty().withMessage('Waktu mulai (start_time) tidak boleh kosong.')
            .isISO8601().withMessage('Format start_time harus ISO8601 (cth: 2025-10-28T10:00:00Z).'),

        // Validasi addons (Array opsional)
        body('addons')
            .optional()
            .isArray().withMessage('Addons harus berupa array.'),

        // Validasi setiap objek di dalam array addons
        body('addons.*.addon_id')
            .if(body('addons').exists()) // Hanya validasi jika array 'addons' ada
            .trim()
            .notEmpty().withMessage('addon_id di dalam array addons tidak boleh kosong.')
            .isUUID().withMessage('addon_id harus berupa UUID.'),

        body('addons.*.quantity')
            .if(body('addons').exists())
            .notEmpty().withMessage('quantity di dalam array addons tidak boleh kosong.')
            .isInt({ min: 1 }).withMessage('quantity addon minimal 1.'),
    ];
};

/**
 * Aturan validasi untuk [R]ead Availability
 * (Dipanggil oleh GET /api/bookings/availability)
 */
const availabilityValidationRules = () => {
    return [
        // Validasi query parameter 'packageId'
        query('packageId')
            .trim()
            .notEmpty().withMessage('packageId (query param) tidak boleh kosong.')
            .isUUID().withMessage('packageId (query param) harus berupa UUID.')
            .custom(async (value) => {
                // Cek apakah paket ada
                const { rows } = await db.query('SELECT 1 FROM packages WHERE package_id = $1', [value]);
                if (rows.length === 0) {
                    throw new ApiError(404, 'Paket dengan ID ini tidak ditemukan.');
                }
            }),

        // Validasi query parameter 'date'
        query('startTime')
            .trim()
            .notEmpty().withMessage('startTime (query param) tidak boleh kosong.')
            .isISO8601().withMessage('Format startTime tidak valid. Harus format ISO8601.')
    ];
};

// =================================================================
// ATURAN UNTUK ADMIN
// =================================================================

/**
 * Aturan validasi untuk parameter ID Pesanan (UUID)
 * (Digunakan oleh GET /:id, PUT /:id, DELETE /:id)
 */
const bookingIdValidationRules = () => {
    return [
        param('bookingId')
            .isUUID().withMessage('ID Pesanan (Booking ID) harus berupa UUID yang valid.')
    ];
};

/**
 * Aturan validasi untuk [U]pdate Status oleh Admin
 * (Dipanggil oleh PUT /api/admin/bookings/:id/status)
 */
const updateStatusValidationRules = () => {
    return [
        // Validasi ID di URL
        param('bookingId').isUUID().withMessage('ID Pesanan (Booking ID) harus berupa UUID.'),

        // Validasi body request (harus berisi 'status')
        body('status')
            .notEmpty().withMessage('Status tidak boleh kosong.')
            .isString().withMessage('Status harus berupa teks.')
            .toUpperCase() // Ubah ke huruf besar
            .isIn(Object.values(BOOKING_STATUS)) // Pastikan statusnya adalah salah satu yang valid
            .withMessage(`Status tidak valid. Harus salah satu dari: ${Object.values(BOOKING_STATUS).join(', ')}`)
    ];
};

/**
 * Aturan validasi untuk [R]eschedule oleh Admin
 * (Dipanggil oleh PUT /api/admin/bookings/:id/reschedule)
 */
const rescheduleValidationRules = () => {
    return [
        // Validasi ID di URL
        param('bookingId').isUUID().withMessage('ID Pesanan (Booking ID) harus berupa UUID.'),

        // Validasi body
        body('newStartTime')
            .trim()
            .notEmpty().withMessage('Waktu mulai baru (new_start_time) tidak boleh kosong.')
            .isISO8601().withMessage('Format new_start_time harus ISO8601 (cth: 2025-10-28T10:00:00Z).'),

        body('newRoomId')
            .trim()
            .notEmpty().withMessage('ID Ruangan baru (new_room_id) tidak boleh kosong.')
            .isUUID().withMessage('new_room_id harus berupa UUID.')
            .custom(async (value) => {
                const { rows } = await db.query('SELECT 1 FROM rooms WHERE room_id = $1', [value]);
                if (rows.length === 0) {
                    throw new ApiError(404, 'Ruangan (Room) dengan new_room_id ini tidak ditemukan.');
                }
            }),

        body('reason')
            .trim()
            .notEmpty().withMessage('Alasan (reason) penjadwalan ulang tidak boleh kosong.')
    ];
};


module.exports = {
    createBookingValidationRules,
    bookingIdValidationRules,
    updateStatusValidationRules,
    rescheduleValidationRules,
    availabilityValidationRules
};