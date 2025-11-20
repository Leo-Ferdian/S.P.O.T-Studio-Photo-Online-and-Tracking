const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const controller = require('../controllers/riwayatBooking.controller');

router.use(authMiddleware);

// GET riwayat booking user
router.get('/', controller.getRiwayatBooking);

module.exports = router;
