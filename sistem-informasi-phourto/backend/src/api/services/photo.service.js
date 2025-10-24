const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const S3Service = require('./s3.service'); 
const logger = require('../../utils/logger');

class PhotoService {

    /**
     * (Fungsi Anda yang sudah ada - tidak diubah)
     * Menyimpan informasi file foto ke database setelah berhasil diunggah ke S3.
     */
    async addPhotosToBooking(bookingId, files) {
        if (!files || files.length === 0) {
            throw new ApiError('Tidak ada file yang diunggah.', 400);
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
                const result = await client.query(query, [bookingId, file.key, file.location]);
                insertedPhotos.push(result.rows[0]);
            }

            await client.query('COMMIT');
            return insertedPhotos;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.warn('Database insert gagal, memulai proses rollback S3...');
            try {
                const deletePromises = files.map(file => S3Service.deleteFile(file.key));
                await Promise.all(deletePromises);
                logger.info('Proses rollback S3 selesai.');
            } catch (s3Error) {
                logger.error('Gagal melakukan rollback S3:', s3Error);
                // Melempar error gabungan atau error S3
            }
            throw error; 
        } finally {
            client.release();
        }
    }

    /**
     * (Fungsi Anda yang sudah ada - tidak diubah)
     * Mengambil semua foto untuk sebuah booking dan menghasilkan Pre-signed URL yang aman.
     */
    async getPhotosByBooking(bookingId, userId) {
        // 1. Verifikasi kepemilikan
        const bookingQuery = `SELECT id FROM phourto.bookings WHERE id = $1 AND user_id = $2`;
        const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

        if (bookingResult.rows.length === 0) {
            throw new ApiError("Akses ditolak. Anda tidak memiliki izin untuk melihat galeri ini.", 403);
        }

        // 2. Ambil semua kunci file
        const photosQuery = `SELECT file_key FROM phourto.photos WHERE booking_id = $1 ORDER BY uploaded_at ASC`;
        const photosResult = await db.query(photosQuery, [bookingId]);
        
        if (photosResult.rows.length === 0) return [];
        
        const photoKeys = photosResult.rows.map(row => row.file_key);

        // 3. Gunakan S3Service untuk membuat Pre-signed URL
        const signedUrls = await Promise.all(
            photoKeys.map(key => S3Service.getSignedUrl(key))
        );

        return signedUrls;
    }

    /**
     * @desc    Mengambil SEMUA foto milik pengguna (dari semua booking)
     * @param   {number} userId - ID pengguna dari token
     * @returns {Promise<Array>} - Array berisi objek foto
     */
    async getPhotosByUserId(userId) {
        logger.info(`Mengambil semua foto untuk user ${userId}`);
        
        // Query ini menggabungkan photos dan bookings untuk memverifikasi kepemilikan
        const query = `
            SELECT p.id, p.booking_id, p.file_url, p.is_watermarked, p.uploaded_at
            FROM phourto.photos p
            JOIN phourto.bookings b ON p.booking_id = b.id
            WHERE b.user_id = $1
            ORDER BY p.uploaded_at DESC
        `;
        
        const result = await db.query(query, [userId]);
        
        // Tes Anda mengharapkan URL asli, bukan pre-signed URL, jadi ini sudah benar.
        // Jika Anda ingin mengembalikan pre-signed URL, Anda harus me-loop
        // dan memanggil S3Service.getSignedUrl untuk setiap 'file_key'.
        
        return result.rows;
    }
    // --- AKHIR FUNGSI BARU ---
}

module.exports = new PhotoService();
