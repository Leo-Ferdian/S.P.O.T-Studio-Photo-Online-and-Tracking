const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller'); 
const authMiddleware = require('../middlewares/auth.middleware');
const UserValidator = require('../validator/user.validator'); 
const asyncHandler = require('../../utils/asyncHandler'); 


// Ini akan melindungi SEMUA rute di bawah ini.
router.use(authMiddleware);

// Rute untuk [R]ead Profil: GET /api/users/profile
router.get(
    '/profile', 
    asyncHandler(userController.getMyProfile) // FIX: Dibungkus dengan asyncHandler
);

// Rute untuk [U]pdate Profil: PUT /api/users/profile
router.put(
    '/profile',
    UserValidator.updateProfileValidationRules(), 
    asyncHandler(userController.updateMyProfile)                // FIX: Dibungkus dengan asyncHandler
);

// Rute untuk [C]hange Password: PATCH /api/users/password
router.patch(
    '/password',
    UserValidator.changePasswordValidationRules(), 
    asyncHandler(userController.changeMyPassword)                // FIX: Dibungkus dengan asyncHandler
);

// Rute untuk [D]elete Akun: DELETE /api/users/profile
router.delete(
    '/profile', 
    asyncHandler(userController.deleteMyAccount) // FIX: Dibungkus dengan asyncHandler
);

module.exports = router;