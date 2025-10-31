require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Untuk mengizinkan request dari frontend
const { logger, morganMiddleware } = require('./src/utils/logger'); // Impor logger dan morgan middleware
const errorHandler = require('./src/utils/errorHandler.js');
const app = express();
const apiError = require('./src/utils/apiError');
const profileRoutes = require('./src/api/routes/user.routes'); // Impor rute profil
const paymentRoutes = require('./src/api/routes/payment.routes');
const photoRoutes = require('./src/api/routes/photo.routes');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Impor rute
const authRoutes = require('./src/api/routes/auth.routes');
const userRoutes = require('./src/api/routes/user.routes');
const packageRoutes = require('./src/api/routes/package.routes');
const branchRoutes = require('./src/api/routes/branch.routes');
const bookingRoutes = require('./src/api/routes/booking.routes');
const authenticateToken = require('./src/api/middlewares/auth.middleware');
const adminPackageRoutes = require('./src/api/routes/admin/package.routes');
const adminBranchRoutes = require('./src/api/routes/admin/branch.routes');
const adminBookingRoutes = require('./src/api/routes/admin/booking.routes');
const adminPhotoRoutes = require('./src/api/routes/admin/photo.routes');
const adminUserRoutes = require('./src/api/routes/admin/user.routes.js')
// const { registerValidationRules, loginValidationRules } = require('./src/api/validator/auth.validator');    

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // Batasi setiap IP hingga 100 permintaan per 15 menit
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit.'
});

// Middleware
app.use(cors()); // Mengaktifkan CORS
app.use(express.json()); // Mem-parsing body request sebagai JSON
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Menambahkan header keamanan
app.use(limiter); // Membatasi jumlah request untuk mencegah serangan DDoS
// app.use(morgan('combined', { stream: logger.stream }));// Logging dengan morgan dan winston

// Rute Utama
app.get('/', (req, res) => {
    res.send('Selamat datang di S.P.O.T API!');
});

// Rute Admin
app.use('/api/admin/packages', adminPackageRoutes); // Rute paket admin
app.use('/api/admin/branches', adminBranchRoutes); // Rute cabang admin
app.use('/api/admin/bookings', adminBookingRoutes); // Rute booking admin
app.use('/api/admin/photos', adminPhotoRoutes); // Rute foto admin
app.use('/api/admin/users', adminUserRoutes); // Rute user admin // Uncomment jika diperlukan

// Route API
app.use('/api/auth', authRoutes); // Rute autentikasi
app.use('/api/packages', packageRoutes); // Rute paket
app.use('/api/branches', branchRoutes); // Rute cabang
app.use('/api/bookings', bookingRoutes); // Rute booking
app.use('/api/profile', profileRoutes); // Gunakan rute profil
app.use('/api/payments', paymentRoutes); // Rute pembayaran
app.use('/api/photos', photoRoutes); // Rute foto
app.use('/api/users', userRoutes); // Rute user

// Logging
app.use(morganMiddleware); // Gunakan morgan middleware untuk logging

// Rute Protected
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: `Halo ${req.user.name}, endpoint ini terproteksi!`,
        user: req.user
    });
});

//Error handling middleware
app.use((req, res, next) => {
    next(new apiError(404, 'Endpoint tidak ditemukan.'));
});

//cors configuration
app.use(cors({
    origin: 'http://localhost:5173', // nanti diubah ke domain frontend
    credentials: true
}));
app.use(errorHandler);

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
// Export app untuk testing atau penggunaan lainnya
module.exports = app;