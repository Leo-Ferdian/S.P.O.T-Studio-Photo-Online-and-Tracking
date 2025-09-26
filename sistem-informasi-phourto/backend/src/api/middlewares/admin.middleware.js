const db = require('../../config/database');
const apiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @middleware isAdmin
 * @description Middleware untuk memverifikasi apakah pengguna yang login memiliki peran 'admin'.
 * Middleware ini harus dijalankan SETELAH authMiddleware.
 */
const isAdmin = asyncHandler(async (req, res, next) => {
    // req.user akan ada karena sudah di-set oleh auth.middleware.js sebelumnya
    const userId = req.user.id;

    // Ambil peran pengguna dari database
    const userResult = await db.query('SELECT role FROM phourto.users WHERE id = $1', [userId]);

    // Jika pengguna tidak ditemukan di database (meskipun token valid, ini kasus aneh)
    if (userResult.rows.length === 0) {
        throw new apiError (404, 'Pengguna yang terkait dengan token ini tidak ditemukan.');
    }

    const userRole = userResult.rows.role;

    // Periksa apakah perannya adalah 'admin'
    if (userRole!== 'admin') {
        // Jika bukan admin, kirim error 403 Forbidden
        // 403 artinya "Saya tahu siapa Anda, tapi Anda tidak diizinkan mengakses ini."
        throw new apiError (403, 'Akses ditolak. Anda tidak memiliki hak akses admin.');
    }

    // Jika pengguna adalah admin, lanjutkan ke controller berikutnya
    next();
});

module.exports = isAdmin;