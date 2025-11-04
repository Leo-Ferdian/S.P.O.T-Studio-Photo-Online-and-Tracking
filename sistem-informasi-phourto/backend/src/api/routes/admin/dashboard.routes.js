const express = require('express');
const router = express.Router();

// 1. Impor Kontroler (yang akan kita buat nanti)
const DashboardController = require('../../controllers/admin/dashboard.controller');

// 2. Impor Middleware Keamanan
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');

// 3. Terapkan Middleware Keamanan
router.use(authMiddleware, isAdmin);

// 4. Definisikan Rute
// GET /api/admin/dashboard/stats
router.get('/stats', DashboardController.getStats);

module.exports = router;