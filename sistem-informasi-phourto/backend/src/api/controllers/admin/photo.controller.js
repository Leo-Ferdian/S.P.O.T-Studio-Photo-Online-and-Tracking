const PhotoService = require('../../services/photo.service');
const S3Service = require('../../services/s3.service'); // Kita impor untuk middleware upload
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/apiResponse');
const ApiError = require('../../../utils/apiError');
const { isUUID } = require('validator');
const { logger } = require('../../../utils/logger');

class AdminPhotoController {

    /**
     * [ADMIN] Meng-upload satu atau lebih file foto untuk sebuah booking.
     * Ini adalah endpoint yang akan dipanggil oleh Admin Panel.
     * Middleware S3Service.upload akan berjalan LEBIH DULU.
     * * @route POST /api/admin/photos/upload/:bookingId
     */
    uploadBookingPhotos = asyncHandler(async (req, res) => {
        // 1. Ambil ID dari parameter URL dan token JWT
        const { bookingId } = req.params;
        const adminUserId = req.user.user_id; // Diambil dari token (sesuai refactor V1.6)

        // 2. Ambil file dari request (sudah di-upload ke S3 oleh middleware)
        // 'req.files' adalah array objek file yang disediakan oleh multer-s3
        const files = req.files;

        logger.debug(`[AdminPhotoController] Menerima ${files?.length || 0} file untuk booking: ${bookingId}`);

        // 3. Validasi
        if (!isUUID(bookingId)) {
            throw new ApiError(400, "Booking ID tidak valid.");
        }
        if (!files || files.length === 0) {
            // Ini seharusnya ditangani oleh middleware upload, tapi sebagai penjaga
            throw new ApiError(400, "Tidak ada file yang diterima.");
        }
        if (!adminUserId) {
            // Ini seharusnya ditangani oleh adminMiddleware
            throw new ApiError(401, "Admin tidak terautentikasi.");
        }

        // 4. Panggil PhotoService (dari file V1.10 kita)
        // Service ini akan menangani:
        // - INSERT ke tabel 'photos'
        // - UPDATE status 'bookings' (COMPLETED)
        // - UPDATE 'photo_delivery_url'
        // - INSERT ke 'booking_history' (Jejak Audit)
        // - Rollback S3 jika DB gagal
        const insertedPhotos = await PhotoService.addPhotosToBooking(bookingId, files, adminUserId);

        // 5. Kirim respons sukses
        const responseMessage = `${insertedPhotos.length} file berhasil diunggah dan ditautkan ke booking ${bookingId}. Status pesanan diperbarui menjadi COMPLETED.`;
        new ApiResponse(res, 201, {
            bookingId: bookingId,
            photosAdded: insertedPhotos.length,
            files: insertedPhotos.map(p => p.file_name_original) // Kirim kembali daftar nama file
        }, responseMessage);
    });

    /**
     * [ADMIN] Middleware untuk menangani upload S3.
     * Kita mengeksposnya dari sini agar rute admin bisa menggunakannya.
     * Ini akan menangani 10 file sekaligus dengan nama field 'photos'
     */
    handleUploadMiddleware() {
        // 'photos' adalah nama field di form-data
        // 10 adalah jumlah file maksimum per request
        return S3Service.upload.array('photos', 10); 
    }
}

module.exports = new AdminPhotoController();

