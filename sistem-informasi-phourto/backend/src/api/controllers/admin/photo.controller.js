const PhotoService = require('../../services/photo.service');
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/responseHandler');
const ApiError = require('../../../utils/apiError'); // Impor ApiError untuk validasi

class AdminPhotoController {
    /**
     * Menyimpan informasi foto ke database SETELAH middleware upload S3 selesai.
     */
    uploadPhotos = asyncHandler(async (req, res) => {
        const { bookingId } = req.params;
        // Informasi file yang diunggah tersedia di req.files berkat middleware multer-s3
        const files = req.files;

        // Validasi: pastikan ada file yang diunggah
        if (!files || files.length === 0) {
            throw new ApiError(400, 'Tidak ada file yang valid untuk diunggah.');
        }

        // Panggil service untuk menyimpan informasi file ke database
        const savedPhotos = await PhotoService.addPhotosToBooking(bookingId, files);

        new ApiResponse(res, 201, {
            message: `${savedPhotos.length} foto berhasil diunggah untuk booking ID ${bookingId}.`,
            photos: savedPhotos
        });
    });
}

module.exports = new AdminPhotoController();