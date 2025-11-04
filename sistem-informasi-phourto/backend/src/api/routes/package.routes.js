const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/package.controller');
const { packageIdValidationRules } = require('../validator/package.validator'); // Validator untuk GET detail

// Rute untuk mendapatkan semua paket sederhana (GET /api/packages/)
router.get('/', PackageController.getAll);

// Rute untuk mendapatkan katalog lengkap (JOIN) (GET /api/packages/catalog)
router.get('/catalog', PackageController.getFullCatalog);

// Rute untuk mendapatkan detail paket + addons (GET /api/packages/:packageId)
router.get(
    '/:packageId', 
    packageIdValidationRules(), 
    PackageController.getPackageById
);

module.exports = router;