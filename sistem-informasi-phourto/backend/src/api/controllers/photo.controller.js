const PhotoService = require('../services/photo.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiResponse = require('../../utils/apiResponse');

class PhotoController {

    /**
     * @desc    Mendapatkan semua foto milik pengguna yang sedang login
     * @route   GET /api/photos
     * @access  Private
     */
    getMyPhotos = asyncHandler(async (req, res) => {
        // Ambil ID pengguna dari token (yang disisipkan oleh authMiddleware)
        const userId = req.user.id; 
        
        const photos = await PhotoService.getPhotosByUserId(userId);
        
        new apiResponse(res, 200, photos, 'Foto berhasil diambil.');
    });

    // Anda bisa tambahkan fungsi lain di sini nanti (getById, delete, dll.)
}

module.exports = new PhotoController();