const { body, param } = require('express-validator');
const db = require('../../config/database');
const ApiError = require('../../utils/apiError');

/**
 * Aturan validasi untuk parameter ID Paket (UUID)
 * Digunakan oleh: GET /:id, PUT /:id, DELETE /:id
 */
const packageIdValidationRules = () => {
    return [
        param('id')
            .isUUID().withMessage('ID Paket (Package ID) harus berupa UUID yang valid.')
    ];
};

/**
 * Aturan validasi untuk body (data) Paket
 * Digunakan oleh: POST /, PUT /:id
 * Ini memvalidasi struktur body yang dikirim oleh Admin Panel:
 * {
 * "packageData": { ...detail paket... },
 * "addons": [ { ...detail addon... } ]
 * }
 */
const packageBodyValidationRules = () => {
    return [
        // === Validasi packageData ===
        body('packageData').exists().withMessage('Objek packageData tidak boleh kosong.'),

        body('packageData.room_id')
            .trim()
            .notEmpty().withMessage('room_id tidak boleh kosong.')
            .isUUID().withMessage('room_id harus berupa UUID ruangan yang valid.')
            // Cek kustom: Pastikan room_id ada di tabel 'rooms'
            .custom(async (value) => {
                const { rows } = await db.query('SELECT 1 FROM rooms WHERE room_id = $1', [value]);
                if (rows.length === 0) {
                    throw new ApiError(404, 'Ruangan (Room) dengan room_id ini tidak ditemukan.');
                }
            }),

        body('packageData.package_name')
            .trim()
            .notEmpty().withMessage('Nama paket (package_name) tidak boleh kosong.'),

        body('packageData.price')
            .notEmpty().withMessage('Harga (price) tidak boleh kosong.')
            .isNumeric().withMessage('Harga harus berupa angka.'),

        body('packageData.price_type')
            .notEmpty().withMessage('Tipe harga (price_type) tidak boleh kosong.')
            .isIn(['per_package', 'per_person'])
            .withMessage("price_type harus 'per_package' atau 'per_person'."),

        body('packageData.duration_in_minutes')
            .notEmpty().withMessage('Durasi (duration_in_minutes) tidak boleh kosong.')
            .isInt({ min: 1 }).withMessage('Durasi (menit) harus berupa angka positif.'),

        // Validasi opsional (boleh null atau string)
        body('packageData.capacity').optional().trim(),
        body('packageData.duration').optional().trim(),
        body('packageData.inclusions').optional().trim(),


        // === Validasi addons (Array) ===
        body('addons')
            .optional() // Addons boleh tidak ada (array kosong atau null)
            .isArray().withMessage('Addons harus berupa array (daftar).'),

        // Validasi setiap objek di dalam array addons
        body('addons.*.addon_name')
            .trim()
            .notEmpty().withMessage('Nama addon (addon_name) tidak boleh kosong.'),
        
        body('addons.*.addon_price')
            .notEmpty().withMessage('Harga addon (addon_price) tidak boleh kosong.')
            .isNumeric().withMessage('Harga addon harus berupa angka.'),
        
        body('addons.*.addon_unit')
            .optional().trim(),

        body('addons.*.max_qty')
            .notEmpty().withMessage('Max Qty addon tidak boleh kosong.')
            .isInt({ min: 0 }).withMessage('Max Qty harus berupa angka (0 atau lebih).'),
        
        // (Khusus untuk UPDATE) Validasi addon_id jika ada
        body('addons.*.addon_id')
            .optional() // Hanya ada saat UPDATE
            .isUUID().withMessage('addon_id (jika ada) harus berupa UUID.')
    ];
};

module.exports = {
    packageIdValidationRules,
    packageBodyValidationRules
};