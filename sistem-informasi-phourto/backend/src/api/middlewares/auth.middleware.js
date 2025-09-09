const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    console.log("Authorization Header:", req.headers['authorization']); // log header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Ambil token setelah "Bearer"

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