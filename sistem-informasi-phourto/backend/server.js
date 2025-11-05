require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logger, morganMiddleware } = require('./src/utils/logger');
const errorHandler = require('./src/utils/errorHandler.js');
const apiError = require('./src/utils/apiError');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();

// Impor rute
const authRoutes = require('./src/api/routes/auth.routes');
const userRoutes = require('./src/api/routes/user.routes');
const packageRoutes = require('./src/api/routes/package.routes');
const branchRoutes = require('./src/api/routes/branch.routes');
const bookingRoutes = require('./src/api/routes/booking.routes');
const paymentRoutes = require('./src/api/routes/payment.routes');
const photoRoutes = require('./src/api/routes/photo.routes');
// Rute Admin
const adminPackageRoutes = require('./src/api/routes/admin/package.routes');
const adminBranchRoutes = require('./src/api/routes/admin/branch.routes');
const adminBookingRoutes = require('./src/api/routes/admin/booking.routes');
const adminPhotoRoutes = require('./src/api/routes/admin/photo.routes');
const adminUserRoutes = require('./src/api/routes/admin/user.routes.js');
const adminDashboardRoutes = require('./src/api/routes/admin/dashboard.routes.js');

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit.'
});

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(limiter);
// app.use(morgan('combined', { stream: logger.stream }));// Logging dengan morgan dan winston
app.use(morganMiddleware);


// =========================================================
// 1. RUTE UTAMA & PUBLIK (TANPA TOKEN)
// =========================================================

// Rute Utama
app.get('/', (req, res) => {
    res.send('Selamat datang di S.P.O.T API!');
});

// Rute Auth (Login/Register)
app.use('/api/auth', authRoutes);

// Rute Katalog Publik (Package dan Branch)
// TIDAK MEMBUTUHKAN TOKEN, jadi dipasang di sini.
app.use('/api/packages', packageRoutes);
app.use('/api/branches', branchRoutes);


// =========================================================
// 2. RUTE YANG DIPROTEKSI (MEMBUTUHKAN TOKEN)
// =========================================================

// Route API (Pelanggan)
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/photos', photoRoutes);
// Rute Admin
app.use('/api/admin/packages', adminPackageRoutes);
app.use('/api/admin/branches', adminBranchRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/photos', adminPhotoRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);


// Error handling for 404 (Endpoint not found)
app.use((req, res, next) => {
    next(new apiError(404, 'Endpoint tidak ditemukan.'));
});

// Error handling middleware utama
app.use(errorHandler);


// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
// Export app untuk testing atau penggunaan lainnya
module.exports = app;