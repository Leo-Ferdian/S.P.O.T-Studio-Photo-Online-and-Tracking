require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Untuk mengizinkan request dari frontend

// Impor rute
const authRoutes = require('./src/api/routes/auth.routes');
const authenticateToken = require('./src/api/middlewares/auth.middleware');
const { registerValidationRules, loginValidationRules } = require('./src/api/validator/auth.validator');    
const app = express();

// Middleware
app.use(cors()); // Mengaktifkan CORS
app.use(express.json()); // Mem-parsing body request sebagai JSON
app.use(express.urlencoded({ extended: true }));

// Rute Utama
app.get('/', (req, res) => {
    res.send('Selamat datang di S.P.O.T API!');
});

// Gunakan Rute Autentikasi
app.use('/api/auth', authRoutes);

// Rute Protected
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: `Halo ${req.user.name}, endpoint ini terproteksi!`,
        user: req.user
    });
});

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

//Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Terjadi kesalahan pada server!');
});

//cors configuration
app.use(cors({
  origin: 'http://localhost:3000', // nanti diubah ke domain frontend
    credentials: true
}));

// Export app untuk testing atau penggunaan lainnya
// module.exports = app;