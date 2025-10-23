// src/api/validator/booking.validator.js
const { body, param } = require('express-validator');

// Ambil daftar status valid dari service Anda
// Atau definisikan di sini agar konsisten
const VALID_STATUSES = [
    'PENDING_PAYMENT',
    'PAID',
    'COMPLETED',
    'CANCELLED',
    'EXPIRED',
    'FAILED'
];

const createBookingValidationRules = () => {
    return [
        // --- PERBAIKAN: Gunakan snake_case agar cocok dengan controller & service ---
        body('package_id')
            .notEmpty().withMessage('package_id tidak boleh kosong')
            .isInt().withMessage('package_id harus berupa angka'),

        body('branch_id')
            .notEmpty().withMessage('branch_id tidak boleh kosong')
            .isInt().withMessage('branch_id harus berupa angka'),

        body('booking_time')
            .notEmpty().withMessage('booking_time tidak boleh kosong')
            .isISO8601().withMessage('Format booking_time harus ISO8601 (contoh: 2025-10-28T10:00:00Z)'),

        body('payment_type')
            .notEmpty().withMessage('payment_type tidak boleh kosong')
            .isString().withMessage('payment_type harus berupa string'),
    ];
};

// --- TAMBAHAN BARU: Ini yang dicari oleh file rute Anda ---
const updateStatusValidationRules = () => {
    return [
        // Validasi ID di URL
        param('id').isInt().withMessage('ID booking harus berupa angka'),

        // Validasi body request (harus berisi 'status')
        body('status')
            .notEmpty().withMessage('Status tidak boleh kosong')
            .isString().withMessage('Status harus berupa teks')
            .toUpperCase() // Ubah ke huruf besar
            .isIn(VALID_STATUSES) // Pastikan statusnya adalah salah satu yang valid
            .withMessage(`Status tidak valid. Harus salah satu dari: ${VALID_STATUSES.join(', ')}`)
    ];
};
// --- AKHIR TAMBAHAN BARU ---

module.exports = {
    createBookingValidationRules,
    updateStatusValidationRules, // <-- PERBAIKAN: Ekspor fungsi baru
};