const PhotoService = require('../services/photo.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/apiError');
const { validationResult } = require('express-validator');
const { logger } = require('../../utils/logger'); // Import logger

class PhotoController {
    
    /**
     * @route GET /api/photos/:bookingId/gallery
     * @desc Mengambil galeri foto untuk sebuah booking milik pengguna yang sedang login.
     */
    getBookingGallery = asyncHandler(async (req, res) => {
        // Logika validasi harus diterapkan di rute
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi bookingId gagal.', errors.array());
        }

        const { bookingId } = req.params;
        // userId dari token JWT (V1.9)
        const userId = req.user.user_id; 

        // Panggil service untuk mengambil URL foto yang aman
        const photoUrls = await PhotoService.getPhotosByBooking(bookingId, userId);

        new ApiResponse(res, 200, photoUrls, "Galeri berhasil diambil.");
    });


    // =================================================================
    // FUNGSI BARU V1.13: Logika ZIP Asynchronous
    // =================================================================

    /**
     * @route POST /api/photos/:bookingId/download
     * @desc Memicu proses pembuatan file .zip galeri
     */
    triggerGalleryDownload = asyncHandler(async (req, res) => {
        // Logika validasi harus diterapkan di rute
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi bookingId gagal.', errors.array());
        }
        
        const { bookingId } = req.params;
        const userId = req.user.user_id;

        logger.info(`Customer ${userId} memicu pembuatan ZIP untuk booking ${bookingId}`);

        // Panggil service untuk memicu Lambda/Worker
        // Service V1.13 akan menangani logika cek status COMPLETED dan PENDING/READY
        const result = await PhotoService.triggerZipWorker(bookingId, userId);

        new ApiResponse(res, 200, result, result.message);
    });

    /**
     * @route GET /api/photos/:bookingId/download-status
     * @desc Endpoint polling untuk memeriksa status file .zip dan mendapatkan link
     */
    getDownloadStatus = asyncHandler(async (req, res) => {
        // Logika validasi harus diterapkan di rute
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validasi bookingId gagal.', errors.array());
        }

        const { bookingId } = req.params;
        const userId = req.user.user_id;

        logger.debug(`Customer ${userId} mengecek status ZIP untuk booking ${bookingId}`);

        // Panggil service untuk memeriksa status
        // Service V1.13 akan menangani logika generate Pre-signed URL jika status READY
        const statusResult = await PhotoService.getZipStatus(bookingId, userId);
        
        new ApiResponse(res, 200, statusResult, statusResult.message);
    });
}

module.exports = new PhotoController();
