const express = require('express');
const router = express.Router();
const BranchController = require('../controllers/branch.controller');

// Rute untuk mendapatkan semua cabang studio
// GET /api/branches
router.get('/', BranchController.getAll);

module.exports = router;