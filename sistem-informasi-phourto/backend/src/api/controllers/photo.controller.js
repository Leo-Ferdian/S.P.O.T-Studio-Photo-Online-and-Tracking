const PhotoService = require('../../services/photo.service');
const S3Service = require('../../services/s3.service');
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/responseHandler');

class AdminPhotoController {
    /**
     * Menangani unggahan beberapa file foto untuk sebuah booking.
     */
    uploadPhotos = [
        // Langkah 1: Gunakan middleware 'upload' dari S3Service.
        // 'photos' adalah nama field, dan 100 adalah batas maksimal file.
        S3Service.upload.array('photos', 100),

        // Langkah 2: Gunakan asyncHandler untuk menangani logika setelah upload selesai.
        asyncHandler(async (req, res) => {
            const { bookingId } = req.params;
            const files = req.files; // Informasi file yang diunggah tersedia di req.files

            if (!files || files.length === 0) {
                new ApiResponse(res, 400, null, 'Tidak ada file yang valid untuk diunggah.');
                return;
            }

            // Simpan informasi file ke database
            const savedPhotos = await PhotoService.addPhotosToBooking(bookingId, files);

            new ApiResponse(res, 201, {
                message: `${savedPhotos.length} foto berhasil diunggah untuk booking ID ${bookingId}.`,
                photos: savedPhotos
            });
        })
    ];
}

module.exports = new AdminPhotoController();