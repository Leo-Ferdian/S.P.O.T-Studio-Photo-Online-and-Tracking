const PhotoService = require('../../services/photo.service');
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/apiResponse');

class AdminPhotoController {
    uploadPhoto = asyncHandler(async (req, res) => {
        const { bookingId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
        }

        const newPhoto = await PhotoService.uploadPhotoForBooking(bookingId, file);
        new ApiResponse(res, 201, newPhoto, 'Foto berhasil diunggah.');
    });
}

module.exports = new AdminPhotoController();