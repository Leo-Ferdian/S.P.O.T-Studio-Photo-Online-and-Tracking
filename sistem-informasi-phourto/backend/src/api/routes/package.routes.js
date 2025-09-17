const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/package.controller');

// Rute untuk mendapatkan semua paket foto
// GET /api/packages
router.get('/', PackageController.getAll);

module.exports = router;