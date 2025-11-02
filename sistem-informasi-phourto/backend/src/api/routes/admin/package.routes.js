const express = require('express');
const router = express.Router();
const AdminPackageController = require('../../controllers/admin/package.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const isAdmin = require('../../middlewares/admin.middleware');

const { 
    packageBodyValidationRules, 
    packageIdValidationRules 
} = require('../../validator/package.validator');

// 2. Terapkan Middleware Keamanan
// Semua rute di file ini dilindungi (hanya Admin bisa akses)
router.use(authMiddleware, isAdmin);

// 3. Definisikan Rute CRUD

// GET /api/admin/packages
// (R)ead All - Memanggil getFullCatalog
router.get('/', AdminPackageController.getAllPackages);

// POST /api/admin/packages
// (C)reate - Memanggil createFullPackage
router.post(
    '/', 
    packageBodyValidationRules(), 
    AdminPackageController.createPackage
);

// GET /api/admin/packages/:packageId
// (R)ead One - Memanggil getPackageById
router.get(
    '/:packageId', 
    packageIdValidationRules(), 
    AdminPackageController.getPackageById
);

// PUT /api/admin/packages/:packageId
// (U)pdate - Memanggil updateFullPackage
router.put(
    '/:packageId', 
    packageIdValidationRules(), 
    packageBodyValidationRules(), 
    AdminPackageController.updatePackage
);

// DELETE /api/admin/packages/:packageId
// (D)elete
router.delete(
    '/:packageId', 
    packageIdValidationRules(), 
    AdminPackageController.deletePackage
);

module.exports = router;