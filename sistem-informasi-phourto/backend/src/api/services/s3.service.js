const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const apiError = require('../../utils/apiError');

// Konfigurasi S3 dari environment variables
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

class S3Service {
    /**
     * Mengunggah sebuah file ke AWS S3.
     * @param {object} file - Objek file dari multer (req.file).
     * @param {string} folderPath - Path folder di dalam bucket (e.g., 'photos/booking-123/').
     * @returns {Promise<object>} - Objek berisi informasi file yang diunggah (Key, Location/URL).
     */
    async uploadFile(file, folderPath) {
        const fileStream = fs.createReadStream(file.path);

        const uploadParams = {
            Bucket: bucketName,
            Body: fileStream,
            Key: `${folderPath}${Date.now()}-${file.originalname}` // Nama file unik
        };

        try {
            const result = await s3.upload(uploadParams).promise();
            fs.unlinkSync(file.path); // Hapus file dari server lokal setelah diunggah
            return result; // result.Key dan result.Location
        } catch (error) {
            fs.unlinkSync(file.path); // Pastikan file lokal tetap dihapus jika gagal
            throw new apiError(500, 'Gagal mengunggah file ke S3.');
        }
    }
}

module.exports = new S3Service();