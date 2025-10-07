const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const S3Service = require('./s3.service'); // Pastikan S3Service diimpor dengan benar

class PhotoService {

    /**
     * Menyimpan informasi file foto ke database setelah berhasil diunggah ke S3.
     * Fungsi ini dipanggil oleh controller setelah middleware upload multer-s3 selesai.
     * @param {number} bookingId - ID dari booking terkait.
     * @param {Array<object>} files - Array objek file dari multer-s3 (berisi .key dan .location).
     * @returns {Promise<Array>} - Daftar data foto yang disimpan.
     */
    async addPhotosToBooking(bookingId, files) {
        if (!files || files.length === 0) {
            throw new ApiError(400, 'Tidak ada file yang diunggah.');
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const insertedPhotos = [];
            for (const file of files) {
                const query = `
                    INSERT INTO phourto.photos (booking_id, file_key, file_url)
                    VALUES ($1, $2, $3)
                    RETURNING id, booking_id, file_key
                `;
                // file.key adalah path file di S3, file.location adalah URL lengkapnya
                const result = await client.query(query, [bookingId, file.key, file.location]);
                insertedPhotos.push(result.rows[0]);
            }

            await client.query('COMMIT');
            return insertedPhotos;
        } catch (error) {
            await client.query('ROLLBACK');
            // TODO: Tambahkan logika untuk menghapus file yang sudah terunggah ke S3 jika DB insert gagal,
            // ini adalah pola 'saga' yang lebih kompleks untuk memastikan konsistensi.
            throw error; // Biarkan asyncHandler yang menangkap error
        } finally {
            client.release();
        }
    }

    /**
     * Mengambil semua foto untuk sebuah booking dan menghasilkan Pre-signed URL yang aman.
     * @param {number} bookingId - ID dari booking.
     * @param {number} userId - ID dari pengguna yang meminta, untuk verifikasi kepemilikan.
     * @returns {Promise<Array>} - Array berisi URL foto yang aman dan dapat diakses sementara.
     */
    async getPhotosByBooking(bookingId, userId) {
        // 1. Verifikasi kepemilikan: Pastikan booking ini milik pengguna yang meminta
        const bookingQuery = `SELECT id FROM phourto.bookings WHERE id = $1 AND user_id = $2`;
        const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

        if (bookingResult.rows.length === 0) {
            throw new ApiError(403, "Akses ditolak. Anda tidak memiliki izin untuk melihat galeri ini.");
        }

        // 2. Ambil semua kunci file (file_key) dari database untuk booking ini
        const photosQuery = `SELECT file_key FROM phourto.photos WHERE booking_id = $1 ORDER BY uploaded_at ASC`;
        const photosResult = await db.query(photosQuery, [bookingId]);
        
        if (photosResult.rows.length === 0) {
            return []; // Kembalikan array kosong jika tidak ada foto
        }
        
        const photoKeys = photosResult.rows.map(row => row.file_key);

        // 3. Gunakan S3Service untuk membuat Pre-signed URL untuk setiap foto
        const signedUrls = await Promise.all(
            photoKeys.map(key => S3Service.getSignedUrl(key))
        );

        return signedUrls;
    }
}

module.exports = new PhotoService();