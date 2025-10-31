const PhotoService = require('../services/photo.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/responseHandler');
const ApiError = require('../../utils/apiError');

class PhotoController {
    /**
     * Mengambil galeri foto untuk sebuah booking milik pengguna yang sedang login.
     */
    getBookingGallery = asyncHandler(async (req, res) => {
        // Ambil bookingId dari parameter URL
        const { bookingId } = req.params;
        
        // Ambil userId dari token JWT (yang sudah divalidasi oleh authMiddleware)
        const userId = req.user.id; 

        if (!bookingId) {
            throw new ApiError(400, "Booking ID diperlukan.");
        }

        // Panggil service untuk mengambil URL foto yang aman
        // Service ini akan memverifikasi bahwa bookingId tersebut benar-benar milik userId
        const photoUrls = await PhotoService.getPhotosByBooking(bookingId, userId);

        new ApiResponse(res, 200, photoUrls, "Galeri berhasil diambil.");
    });

    // Di masa depan, Anda bisa menambahkan fungsi lain di sini
    // seperti selectFavoritePhotos, dll.
}

module.exports = new PhotoController();