require('dotenv').config();
const { S3Client, GetObjectCommand, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
// const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');

// 1. Inisialisasi S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Validasi ENV
if (!BUCKET_NAME || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    logger.error("Konfigurasi AWS S3 tidak lengkap! Pastikan .env terisi (AWS_BUCKET_NAME, AWS_REGION, dll).");
    // Proses bisa tetap berjalan, tapi upload akan gagal
}

class S3Service {
    constructor() {
        /**
         * Middleware 'upload' ini adalah inti dari service.
         * Ia menangani streaming file langsung ke S3.
         * Ini akan digunakan oleh 'admin/photo.controller.js'.
         */
        this.upload = multer({
            storage: multerS3({
                s3: s3Client,
                bucket: BUCKET_NAME,
                // acl: 'public-read', // File privat, hanya bisa diakses dengan Pre-signed URL
                contentType: multerS3.AUTO_CONTENT_TYPE,
                key: function (req, file, cb) {
                    // Path file di S3: bookings/[uuid-booking-id]/[timestamp]-[nama-file-asli]
                    // req.params.bookingId akan diisi oleh rute Admin
                    const bookingId = req.params.bookingId || 'unknown-booking';

                    // Membersihkan nama file
                    const baseName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, '');
                    const fileName = `${Date.now().toString()}-${baseName}`;

                    // Ini akan menjadi 'file_key' di tabel 'photos' kita
                    const filePath = `bookings/${bookingId}/${fileName}`;

                    logger.debug(`S3 Key generated: ${filePath}`);
                    cb(null, filePath);
                }
            }),
            limits: { fileSize: 1024 * 1024 * 20 }, // Batas ukuran file: 20MB
            fileFilter: function (req, file, cb) {
                // Memfilter untuk hanya menerima file gambar (termasuk format Apple)
                const allowedTypes = /jpeg|jpg|png|heic|heif/;
                const mimetype = allowedTypes.test(file.mimetype);
                // Cek ekstensi file juga
                const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

                if (mimetype || extname) { // Mengizinkan jika mimetype atau ekstensi cocok
                    return cb(null, true);
                }
                cb(new ApiError(400, "Tipe file tidak diizinkan. Hanya (jpeg, jpg, png, heic, heif)."));
            }
        });
    }

    async uploadFile(buffer, key, mimetype) {
        try {
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: mimetype,
                ACL: 'private', // pastikan file tidak publik
            });

            await s3Client.send(command);
            logger.info(`File berhasil diupload ke S3: ${key}`);
            return `s3://${BUCKET_NAME}/${key}`;
        } catch (error) {
            logger.error(`Gagal upload ke S3 untuk key ${key}: ${error.message}`);
            throw error;
        }
    }

    // /**
    //  * Menghasilkan URL sementara yang aman (Pre-signed URL) untuk mengakses file privat di S3.
    //  * Ini akan dipanggil oleh 'photo.service.js' untuk pelanggan.
    //  * @param {string} key - Path file di dalam bucket S3 (cth: 'bookings/uuid/foto.jpg').
    //  * @returns {Promise<string>} - Pre-signed URL yang valid.
    //  */
    // async getSignedUrl(key) {
    //     if (!key) {
    //         logger.warn('getSignedUrl dipanggil dengan key kosong.');
    //         return null;
    //     }

    //     const command = new GetObjectCommand({
    //         Bucket: BUCKET_NAME,
    //         Key: key,
    //     });

    //     try {
    //         // URL akan valid selama 7 hari (standar yang baik untuk link download)
    //         const sevenDaysInSeconds = 60 * 60 * 24 * 7;
    //         const url = await getSignedUrl(s3Client, command, { expiresIn: sevenDaysInSeconds });
    //         logger.debug(`Generated signed URL for key ${key}: ${url}`);
    //         return url;
    //     } catch (error) {
    //         logger.error(`Gagal membuat pre-signed URL untuk key ${key}:`, error);
    //         // Jangan melempar error agar jika 1 dari 100 foto gagal, galeri tetap tampil
    //         return null;
    //     }
    // }

    /**
     * Menghapus sebuah file dari bucket AWS S3.
     * @param {string} key - Path file di dalam bucket S3.
     */
    async deleteFile(key) {
        if (!key) return;

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        try {
            await s3Client.send(command);
            logger.info(`File berhasil dihapus dari S3: ${key}`);
        } catch (error) {
            logger.error(`Gagal menghapus file dari S3 (key: ${key}):`, error);
            // Kita tidak melempar error di sini agar proses utama (jika ada) tidak berhenti,
            // Cukup mencatatnya sebagai kegagalan.
        }
    }
}

// Ekspor sebagai instance agar 'upload' bisa langsung digunakan sebagai middleware
module.exports = new S3Service();

