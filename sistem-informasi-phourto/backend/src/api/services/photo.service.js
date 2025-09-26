const db = require('../../config/database');
const S3Service = require('./s3.service');
const apiError = require('../../utils/apiError');

class PhotoService {
    /**
     * Mengunggah foto untuk sebuah booking dan menyimpan URL-nya ke database.
     * @param {number} bookingId - ID dari booking.
     * @param {object} file - Objek file dari multer.
     * @returns {object} - Data foto yang baru disimpan di database.
     */
    async uploadPhotoForBooking(bookingId, file) {
        // Cek dulu apakah booking-nya ada
        const bookingResult = await db.query('SELECT id FROM phourto.bookings WHERE id = $1', [bookingId]);
        if (bookingResult.rows.length === 0) {
            throw new apiError(404, `Booking dengan ID ${bookingId} tidak ditemukan.`);
        }

        // Tentukan path folder di S3
        const folderPath = `photos/booking-${bookingId}/`;

        // Unggah file ke S3
        const s3Result = await S3Service.uploadFile(file, folderPath);

        // Simpan URL S3 ke database kita
        const query = `
            INSERT INTO phourto.photos (booking_id, file_url, file_key)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const dbResult = await db.query(query,);

        return dbResult.rows;
    }
}

module.exports = new PhotoService();