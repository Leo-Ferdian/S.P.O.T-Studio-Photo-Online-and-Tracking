const PhotoService = require('../services/photo.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { validationResult } = require('express-validator');
const { logger } = require('../../utils/logger');

class PhotoController {

    /**
     * @route GET /api/photos/:bookingId/gallery?email=...
     * @desc Mengambil Detail Booking & Daftar Foto (JSON)
     */
    getBookingGallery = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        const bookingId = req.verifiedBookingId;
        const userId = req.verifiedUserId;

        // [UPDATE] Panggil service yang mengembalikan Detail + Foto
        const galleryData = await PhotoService.getGalleryWithDetails(bookingId, userId);

        new ApiResponse(res, 200, galleryData, "Galeri berhasil diambil.");
    });

    /**
     * @route GET /api/photos/:bookingId/download-zip?email=...
     * @desc Stream ZIP
     */
    downloadGalleryZip = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        const bookingId = req.verifiedBookingId;
        const userId = req.verifiedUserId;

        logger.info(`Memulai streaming ZIP untuk booking: ${bookingId} (User: ${userId})`);

        await PhotoService.streamZipToClient(bookingId, userId, res);
    });

    /**
     * @route GET /api/photos/:bookingId/download-single?email=...&url=...
     * @desc Stream Single Photo (Proxy)
     */
    downloadSinglePhoto = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        const bookingId = req.verifiedBookingId;
        const userId = req.verifiedUserId;
        const photoUrl = req.query.url; // URL foto yang ingin didownload

        if (!photoUrl) {
            throw new ApiError(400, 'Parameter URL foto wajib disertakan.');
        }

        await PhotoService.streamSingleFileToClient(bookingId, userId, photoUrl, res);
    });
}

module.exports = new PhotoController();