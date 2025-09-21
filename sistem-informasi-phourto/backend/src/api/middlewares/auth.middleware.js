const jwt = require('jsonwebtoken');
const apiError = require('../../utils/apiError');
require('dotenv').config();

function authenticateToken(req, res, next) {
    console.log("Authorization Header:", req.headers['authorization']); // log header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Ambil token setelah "Bearer"

    if (!token) {
        // Jika tidak ada token, kirim error 401 Unauthorized
        return next(new apiError('Akses ditolak. Token tidak ditemukan.', 401));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new apiError('Token sudah kadaluarsa.', 401));
            }
            return next(new apiError('Token tidak valid.', 403));
        }
        req.user = user; // simpan data user dari payload JWT
        next();
    });
}

module.exports = authenticateToken;