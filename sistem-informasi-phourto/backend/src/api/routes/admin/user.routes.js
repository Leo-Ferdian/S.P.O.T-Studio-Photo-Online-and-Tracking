const express = require('express');
const router = express.Router();
const AdminUserController = require('../../controllers/admin/user.controller'); 
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');

router.use(authMiddleware, isAdmin);
router.get('/', AdminUserController.getAllUsers);

// --- Contoh Rute Admin Lainnya ---
// router.get('/:id', AdminUserController.getUserById);
// router.delete('/:id', AdminUserController.deleteUser);

module.exports = router;