const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
    console.log("Authorization Header:", req.headers['authorization']); // log header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Ambil token setelah "Bearer"

    if (token == null) {
        // Jika tidak ada token, kirim error 401 Unauthorized
        return res.status(401).json({ message: 'Akses ditolak. Token tidak tersedia.' });
    }

    if (!token) {
        return res.status(401).json({ message: 'Token tidak ada' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token tidak valid' });
        }
        req.user = user; // simpan data user dari payload JWT
        next();
    });
}

module.exports = authenticateToken;