// api/controllers/photo.controller.js (Controller PUBLIK)

const PhotoService = require('../services/photo.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { validationResult } = require('express-validator');
const { logger } = require('../../utils/logger');

class PhotoController {

    /**
     * @route GET /api/photos/gallery?code=...&email=...
     * @desc Mengambil galeri foto (publik tapi tervalidasi)
     */
    getBookingGallery = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        // --- PERBAIKAN: Ambil data dari 'req' (hasil validator) ---
        const bookingId = req.verifiedBookingId;
        const userId = req.verifiedUserId;
        // ----------------------------------------------------

        // Panggil service (Service Anda [cite: 1-180] sudah memeriksa 'userId')
        const photoUrls = await PhotoService.getPhotosByBooking(bookingId, userId);

        new ApiResponse(res, 200, photoUrls, "Galeri berhasil diambil.");
    });

    /**
     * @route POST /api/photos/download?code=...&email=...
     * @desc Memicu proses pembuatan file .zip galeri
     */
    triggerGalleryDownload = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        // --- PERBAIKAN: Ambil data dari 'req' (hasil validator) ---
        const bookingId = req.verifiedBookingId;
        const userId = req.verifiedUserId;
        // ----------------------------------------------------

        logger.info(`Customer (via claim) memicu pembuatan ZIP untuk booking ${bookingId}`);

        const result = await PhotoService.triggerZipWorker(bookingId, userId);

        new ApiResponse(res, 200, result, result.message);
    });

    /**
     * @route GET /api/photos/download-status?code=...&email=...
     * @desc Endpoint polling untuk memeriksa status file .zip
     */
    getDownloadStatus = asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi gagal.', errors.array());
        }

        // --- PERBAIKAN: Ambil data dari 'req' (hasil validator) ---
        const bookingId = req.verifiedBookingId;
        const userId = req.verifiedUserId;
        // ----------------------------------------------------

        logger.debug(`Customer (via claim) mengecek status ZIP untuk booking ${bookingId}`);

        const statusResult = await PhotoService.getZipStatus(bookingId, userId);

        new ApiResponse(res, 200, statusResult, statusResult.message);
    });
}

module.exports = new PhotoController();