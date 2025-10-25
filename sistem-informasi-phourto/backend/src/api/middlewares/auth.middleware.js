const jwt = require('jsonwebtoken');
const apiError = require('../../utils/apiError');
require('dotenv').config();

function authenticateToken(req, res, next) {
    console.log("Authorization Header:", req.headers['authorization']); // log header
    const authHeader = req.headers['authorization'];

    // --- SARAN ---
    // Pengecekan yang lebih kuat: pastikan header ada DAN dimulai dengan 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new apiError('Akses ditolak. Token tidak ditemukan atau format salah.', 401));
    }
    // --- Akhir Saran ---

    const token = authHeader.split(' ')[1]; // Ambil token setelah "Bearer"

    if (!token) {
        // Ini untuk menangani kasus jika headernya hanya "Bearer" tanpa token
        return next(new apiError('Akses ditolak. Token tidak ditemukan.', 401));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new apiError('Token sudah kadaluarsa.', 401));
            }
            // --- PERBAIKAN ---
            // Gunakan 401 untuk token yang tidak valid, bukan 403
            return next(new apiError('Token tidak valid.', 401));
        }
        req.user = user; // simpan data user dari payload JWT
        next();
    });
}

module.exports = authenticateToken;