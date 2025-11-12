const express = require('express');
const router = express.Router();
const AdminRoomController = require('../../controllers/admin/room.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');

// Terapkan Middleware Keamanan
router.use(authMiddleware, isAdmin);

// Definisikan Rute
// GET /api/admin/rooms
router.get('/', AdminRoomController.getAllRooms);

// (Rute CRUD lainnya bisa ditambahkan di sini)

module.exports = router;