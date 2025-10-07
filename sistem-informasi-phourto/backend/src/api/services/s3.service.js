const { S3Client, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');

// 1. Inisialisasi S3 Client menggunakan AWS SDK v3 (versi terbaru)
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

class S3Service {
    constructor() {
        /**
         * Middleware 'upload' ini adalah inti dari refactoring.
         * Ia menggunakan multer dan multer-s3 untuk menangani unggahan file
         * secara langsung (streaming) ke bucket S3 tanpa menyimpannya di server lokal.
         */
        this.upload = multer({
            storage: multerS3({
                s3: s3Client,
                bucket: process.env.S3_BUCKET_NAME,
                acl: 'private', // File diatur sebagai privat, hanya bisa diakses dengan URL khusus
                contentType: multerS3.AUTO_CONTENT_TYPE, // Otomatis mendeteksi tipe file
                key: function (req, file, cb) {
                    // Membuat path file yang unik di dalam bucket S3
                    const bookingId = req.params.bookingId || 'misc';
                    const fileName = `${Date.now().toString()}-${path.basename(file.originalname)}`;
                    const filePath = `booking-${bookingId}/${fileName}`;
                    cb(null, filePath);
                }
            }),
            limits: { fileSize: 1024 * 1024 * 10 }, // Batas ukuran file: 10MB
            fileFilter: function (req, file, cb) {
                // Memfilter untuk hanya menerima file gambar
                const allowedTypes = /jpeg|jpg|png|gif/;
                const mimetype = allowedTypes.test(file.mimetype);
                const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

                if (mimetype && extname) {
                    return cb(null, true);
                }
                cb(new ApiError(400, "Tipe file tidak diizinkan. Hanya unggah file gambar."));
            }
        });
    }

    /**
     * Menghasilkan URL sementara yang aman (Pre-signed URL) untuk mengakses file privat di S3.
     * @param {string} key - Path file di dalam bucket S3 (contoh: 'booking-123/foto.jpg').
     * @returns {Promise<string>} - Pre-signed URL yang valid untuk waktu terbatas.
     */
    async getSignedUrl(key) {
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
        });

        try {
            // URL akan valid selama 1 jam (3600 detik)
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return url;
        } catch (error) {
            logger.error(`Gagal membuat pre-signed URL untuk key ${key}:`, error);
            throw new ApiError(500, 'Gagal menghasilkan URL gambar.');
        }
    }

    /**
     * Menghapus sebuah file dari bucket AWS S3.
     * @param {string} key - Path file di dalam bucket S3 (misal: 'booking-123/foto.jpg').
     */
    async deleteFile(key) {
        const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
        });

        try {
            await s3Client.send(command);
            logger.info(`File berhasil dihapus dari S3: ${key}`);
        } catch (error) {
            logger.error(`Gagal menghapus file dari S3 (key: ${key}):`, error);
            // Kita tidak melempar error di sini agar proses utama tidak berhenti,
            // Cukup mencatatnya sebagai kegagalan.
        }
    }
}

module.exports = new S3Service();