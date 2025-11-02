const apiError = require('../../utils/apiError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @middleware isAdmin
 * @description Middleware untuk memverifikasi apakah pengguna memiliki peran 'admin'.
 * Middleware ini harus dijalankan SETELAH auth.middleware.js
 *
 * --- REFACTORED (Perbaikan Performa) ---
 * Kode ini TIDAK PERLU lagi query ke database.
 * 'auth.service.js' sekarang menempatkan 'role' ke dalam JWT Token.
 * 'auth.middleware.js' (tidak terlihat di sini) harusnya mendekode token 
 * dan menempatkan payload (termasuk 'role') ke 'req.user'.
 * Middleware ini sekarang hanya memeriksa 'req.user.role'.
 */
const isAdmin = asyncHandler(async (req, res, next) => {
    
    // 1. Pastikan middleware auth.js sudah berjalan dan 'req.user' ada
    if (!req.user || typeof req.user.role === 'undefined') {
        // Ini adalah error server jika 'req.user' tidak di-set oleh middleware sebelumnya
        throw new apiError(500, 'Data pengguna (user role) tidak ditemukan di token.');
    }

    // 2. Ambil 'role' langsung dari data token (req.user)
    //    TIDAK PERLU query database lagi.
    const userRole = req.user.role;

    // 3. Periksa apakah perannya adalah 'admin'
    if (userRole !== 'admin') {
        // Jika bukan admin, kirim error 403 Forbidden
        throw new apiError(403, 'Akses ditolak. Anda tidak memiliki hak akses admin.');
    }

    // 4. Jika pengguna adalah admin, lanjutkan
    next();
});

module.exports = isAdmin;