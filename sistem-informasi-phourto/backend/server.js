require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { logger, morganMiddleware } = require('./src/utils/logger');
const errorHandler = require('./src/utils/errorHandler.js');
const apiError = require('./src/utils/apiError');
const app = express();

// =================================================================
// 1. KONFIGURASI MIDDLEWARE (URUTAN PENTING)
// =================================================================

// Konfigurasi CORS (HARUS PALING ATAS)
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Ambil dari .env
    credentials: true
};
app.use(cors(corsOptions)); 

// Middleware Keamanan & Parser
app.use(helmet()); // Header keamanan
app.use(express.json()); // Parsing JSON
app.use(express.urlencoded({ extended: true })); // Parsing URL-encoded

// Definisi Rate Limiter (HARUS DIBUAT SEBELUM DIGUNAKAN)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // Batasi setiap IP hingga 100 permintaan per 15 menit
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit.'
});

// Terapkan limiter ke semua request
app.use(limiter);

// Gunakan logging HANYA jika BUKAN mode tes
// Ini memperbaiki error 'stream.write' dan 'timeout' di Jest
if (process.env.NODE_ENV !== 'test') {
    app.use(morganMiddleware);
}


// =================================================================
// 2. IMPOR RUTE
// =================================================================

// Rute Publik & Pengguna
const authRoutes = require('./src/api/routes/auth.routes');
const userRoutes = require('./src/api/routes/user.routes');
const packageRoutes = require('./src/api/routes/package.routes'); // Asumsi ini rute publik
const branchRoutes = require('./src/api/routes/branch.routes'); // Rute cabang publik
const bookingRoutes = require('./src/api/routes/booking.routes');
const paymentRoutes = require('./src/api/routes/payment.routes');
const photoRoutes = require('./src/api/routes/photo.routes');
const authenticateToken = require('./src/api/middlewares/auth.middleware');

// Rute Admin
const adminPackageRoutes = require('./src/api/routes/admin/package.routes');
const adminBranchRoutes = require('./src/api/routes/admin/branch.routes');
const adminBookingRoutes = require('./src/api/routes/admin/booking.routes');
const adminPhotoRoutes = require('./src/api/routes/admin/photo.routes');


// =================================================================
// 3. DEFINISI RUTE API
// =================================================================

app.get('/', (req, res) => {
    res.send('Selamat datang di S.P.O.T API!');
});

// Rute API Publik & Pengguna
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Ini sudah mencakup rute /profile
app.use('/api/packages', packageRoutes); 
app.use('/api/branches', branchRoutes); 
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes); // Untuk webhook DOKU
app.use('/api/photos', photoRoutes); 

// Rute API Admin
app.use('/api/admin/packages', adminPackageRoutes);
app.use('/api/admin/branches', adminBranchRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/photos', adminPhotoRoutes);

// Rute Protected (Untuk Tes)
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: `Halo ${req.user.name}, endpoint ini terproteksi!`, // Pastikan JWT Anda punya 'name'
        user: req.user
    });
});


// =================================================================
// 4. ERROR HANDLING (HARUS SETELAH RUTE)
// =================================================================

// Tangani 404 - Rute tidak ditemukan
app.use((req, res, next) => {
    next(new apiError('Endpoint tidak ditemukan.', 404));
});

// Gunakan Error Handler Kustom Anda (Ini harus menjadi 'app.use' terakhir)
app.use(errorHandler);


// =================================================================
// 5. JALANKAN SERVER (HARUS PALING AKHIR)
// =================================================================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`Server berjalan di port ${PORT}`);
    });
}

// Export app untuk testing
module.exports = app;
