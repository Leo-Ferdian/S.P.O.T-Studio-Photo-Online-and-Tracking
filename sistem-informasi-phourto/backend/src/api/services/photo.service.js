const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const S3Service = require('./s3.service');
const BookingService = require('./booking.service');
const { logger } = require('../../utils/logger');
const { BOOKING_STATUS } = require('../../config/constants');

// --- IMPOR AWS LAMBDA SDK ---
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
// ----------------------------

// =================================================================
// KONSTANTA V1.13: Status ZIP dan Konfigurasi Lambda
// =================================================================
const ZIP_STATUS = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    READY: 'READY',
    FAILED: 'FAILED'
};
// Nama fungsi Lambda di .env (contoh: SpotZipWorkerFunction)
const LAMBDA_FUNCTION_NAME = process.env.ZIP_WORKER_LAMBDA;

// Inisialisasi Lambda Client
const lambdaClient = new LambdaClient({
    region: process.env.AWS_REGION,
});

class PhotoService {

    /**
     * (Refactored V1.12)
     * Menyimpan informasi file foto ke DB setelah upload S3 berhasil.
     * Mengubah status booking menjadi COMPLETED.
     */
    async addPhotosToBooking(bookingId, files, adminUserId) {
        if (!files || files.length === 0) {
            throw new ApiError(400, 'Tidak ada file yang diunggah.');
        }

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            const insertedPhotos = [];

            // 1. Dapatkan status booking saat ini (untuk rollback S3 jika perlu)
            const bookingCheck = await client.query(
                'SELECT 1 FROM bookings WHERE booking_id = $1 FOR UPDATE',
                [bookingId]
            );
            if (bookingCheck.rows.length === 0) {
                throw new ApiError(404, 'Booking tidak ditemukan.');
            }

            // 2. Loop dan INSERT setiap file ke tabel 'photos' (Tabel V1.10)
            for (const file of files) {
                const query = `
                    INSERT INTO photos (booking_id, file_key, file_url, file_name_original, file_size_bytes, mime_type)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING photo_id, booking_id, file_key
                `;
                const result = await client.query(query, [
                    bookingId,
                    file.key,
                    file.location,
                    file.originalname,
                    file.size,
                    file.mimetype
                ]);
                insertedPhotos.push(result.rows[0]);
            }
            logger.debug(`Berhasil INSERT ${insertedPhotos.length} foto ke tabel 'photos'.`);


            // 3. Reset status ZIP (V1.13)
            await BookingService.resetZipStatus(bookingId, client);
            logger.debug(`ZIP status direset ke PENDING.`);


            // 4. Set URL pengiriman foto (Link Galeri Internal)
            const galleryUrl = `/my-bookings/${bookingId}/gallery`;

            // 5. Panggil 'updateBookingStatusByAdmin' (Mengubah status -> COMPLETED DAN mencatat audit)
            await BookingService.updateBookingStatusByAdmin(
                bookingId,
                BOOKING_STATUS.COMPLETED,
                adminUserId,
                client // Meneruskan klien transaksi
            );

            // 6. Set photo_delivery_url
            await client.query(
                `UPDATE bookings SET photo_delivery_url = $1 WHERE booking_id = $2`,
                [galleryUrl, bookingId]
            );

            await client.query('COMMIT');
            logger.info(`Transaksi berhasil: ${insertedPhotos.length} foto ditambahkan ke ${bookingId}.`);

            return insertedPhotos;

        } catch (error) {
            await client.query('ROLLBACK');

            logger.warn(`Database insert gagal (addPhotosToBooking), memulai proses rollback S3...`);

            try {
                const deletePromises = files.map(file => S3Service.deleteFile(file.key));
                await Promise.all(deletePromises);
                logger.info('Proses rollback S3 (hapus file) selesai.');
            } catch (s3Error) {
                logger.error('KRITIS: Gagal melakukan rollback S3!', s3Error);
                throw new ApiError(500, 'Gagal menyimpan foto DAN gagal rollback S3.');
            }

            if (error instanceof ApiError) throw error;
            throw new ApiError(500, `Gagal menyimpan foto ke database. Error: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * (Refactored V1.10)
     * Mengambil semua foto untuk sebuah booking dan menghasilkan Pre-signed URL yang aman (untuk galeri).
     */
    async getPhotosByBooking(bookingId, userId) {
        // ... (Logika verifikasi kepemilikan dan mengambil file_key tetap sama) ...

        const bookingQuery = `SELECT booking_id FROM bookings WHERE booking_id = $1 AND user_id = $2`;
        const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

        if (bookingResult.rows.length === 0) {
            throw new ApiError(403, "Akses ditolak. Anda tidak memiliki izin untuk melihat galeri ini.");
        }

        const photosQuery = `SELECT file_key FROM photos WHERE booking_id = $1 ORDER BY uploaded_at ASC`;
        const photosResult = await db.query(photosQuery, [bookingId]);

        if (photosResult.rows.length === 0) {
            return [];
        }

        const photoKeys = photosResult.rows.map(row => row.file_key);

        try {
            // Catatan: Ini menghasilkan URL untuk GALERI (file tunggal)
            const signedUrlsPromises = photoKeys.map(key => S3Service.getSignedUrl(key));
            const signedUrls = await Promise.all(signedUrlsPromises);
            const validUrls = signedUrls.filter(url => url !== null);
            return validUrls;
        } catch (s3Error) {
            throw new ApiError(502, 'Gagal mengambil URL gambar dari S3.');
        }
    }

    async getGalleryByBookingId(bookingId) {
        // --- Kueri ini menjalankan kueri satu per satu (SEKUENSIAL) ---
        try {
            // Kueri 1: Ambil detail booking (sudah benar)
            const bookingQuery = `
                SELECT 
                    b.booking_id, 
                    b.payment_status,
                    b.start_time,
                    b.total_price,
                    b.amount_paid,
                    u.full_name as customer_name,
                    p.package_name
                FROM bookings b
                JOIN users u ON b.user_id = u.user_id
                JOIN packages p ON b.package_id = p.package_id
                WHERE b.booking_id = $1;
                `;
            const bookingResult = await db.query(bookingQuery, [bookingId]);

            if (bookingResult.rows.length === 0) {
                throw new ApiError(404, 'Booking dengan ID ini tidak ditemukan.');
            }
            const bookingData = bookingResult.rows[0];

            // --- PERBAIKAN DI SINI ---
            // Kueri 2: Ambil 'file_url' (link publik)
            const photosQuery = `
                SELECT 
                    photo_id, 
                    file_url, 
                    file_name_original
                FROM photos 
                WHERE booking_id = $1 
                ORDER BY uploaded_at ASC;
                `;
            const photosResult = await db.query(photosQuery, [bookingId]);

            // // Langkah 3: Generate Pre-signed URLs
            // const photoKeys = photosResult.rows.map(p => p.file_key);
            // // Panggil S3Service untuk membuat URL aman
            // const signedUrlsPromises = photoKeys.map(key => S3Service.getSignedUrl(key));
            // const signedUrls = await Promise.all(signedUrlsPromises);

            // Gabungkan data asli (id, name) dengan URL yang aman
            const photosData = photosResult.rows.map((photo, index) => ({
                photo_id: photo.photo_id,
                url: photo.file_url, // Gunakan URL langsung dari DB
                name: photo.file_name_original
            }));

            // Kembalikan hasil akhir
            return {
                booking: bookingData,
                photos: photosData
            };

        } catch (error) {
            logger.error('Error in getGalleryByBookingId (Admin):', error);
            if (error instanceof ApiError) throw error;
            // Kirim pesan error yang lebih spesifik jika ada
            throw new ApiError(error.message || 'Gagal mengambil data galeri dari database.', 500);
        }
    }

    // =================================================================
    // FUNGSI BARU V1.13: Logika ZIP Asynchronous
    // =================================================================

    /**
     * FUNGSI BARU V1.13: Memicu Worker (Lambda) untuk membuat file ZIP.
     * @param {string} bookingId - UUID booking
     * @param {string} userId - UUID pelanggan
     */
    async triggerZipWorker(bookingId, userId) {
        const client = await db.getClient();
        try {
            // 1. Ambil status booking (V1.13)
            const bookingResult = await client.query(
                'SELECT zip_status, payment_status, photo_delivery_url FROM bookings WHERE booking_id = $1 AND user_id = $2 FOR UPDATE',
                [bookingId, userId]
            );
            const booking = bookingResult.rows[0];

            if (!booking || booking.payment_status !== BOOKING_STATUS.COMPLETED) {
                throw new ApiError(403, 'Akses ditolak. Unduhan hanya tersedia untuk pesanan yang Selesai (COMPLETED).');
            }

            // 2. Cek apakah sudah READY atau sedang diproses
            if (booking.zip_status === ZIP_STATUS.READY) {
                return { success: true, message: 'File ZIP sudah siap. Silakan cek status untuk mendapatkan link.', status: ZIP_STATUS.READY };
            }
            if (booking.zip_status === ZIP_STATUS.PROCESSING) {
                return { success: true, message: 'File ZIP sedang diproses. Silakan tunggu.', status: ZIP_STATUS.PROCESSING };
            }

            // 3. Ubah status di DB menjadi PROCESSING dan catat audit
            await client.query(
                `UPDATE bookings SET zip_status = $1, updated_at = CURRENT_TIMESTAMP WHERE booking_id = $2`,
                [ZIP_STATUS.PROCESSING, bookingId]
            );

            // 4. Panggil Lambda/Worker (Implementasi Nyata)
            if (!LAMBDA_FUNCTION_NAME) {
                logger.error('LAMBDA_FUNCTION_NAME belum diatur di file .env!');
                throw new ApiError(500, 'Konfigurasi worker ZIP bermasalah.');
            }

            const payload = {
                BookingId: bookingId,
                BucketName: process.env.AWS_BUCKET_NAME
                // Lambda akan mengambil file_key dari tabel 'photos'
            };

            const command = new InvokeCommand({
                FunctionName: LAMBDA_FUNCTION_NAME,
                Payload: JSON.stringify(payload),
                InvocationType: 'Event', // Asynchronous invocation (tidak menunggu respons)
            });

            await lambdaClient.send(command);
            logger.info(`[WORKER] Memicu Lambda ZIP Worker untuk booking: ${bookingId}.`);

            await client.query('COMMIT');

            return { success: true, message: 'Proses pembuatan file ZIP dimulai. Silakan tunggu 1-2 menit.', status: ZIP_STATUS.PROCESSING };

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error(`Error saat memicu ZIP worker untuk booking ${bookingId}:`, error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Gagal memicu proses ZIP file.', 500);
        } finally {
            client.release();
        }
    }

    /**
     * FUNGSI BARU V1.13: Mengecek status ZIP dan mengembalikan link download (Pre-signed URL).
     * @param {string} bookingId - UUID booking
     * @param {string} userId - UUID pelanggan
     */
    async getZipStatus(bookingId, userId) {
        // 1. Ambil data booking (V1.13)
        const bookingQuery = `
            SELECT zip_status, zip_file_key, zip_created_at, payment_status, user_id
            FROM bookings 
            WHERE booking_id = $1 AND user_id = $2
        `;
        const result = await db.query(bookingQuery, [bookingId, userId]);
        const booking = result.rows[0];

        if (!booking || booking.payment_status !== BOOKING_STATUS.COMPLETED) {
            throw new ApiError(403, 'Akses ditolak atau pesanan belum COMPLETED.');
        }

        const statusData = {
            status: booking.zip_status,
            createdAt: booking.zip_created_at,
            downloadUrl: null,
            message: `Status saat ini: ${booking.zip_status}.`
        };

        // 2. Jika status READY, generate Pre-signed URL
        if (booking.zip_status === ZIP_STATUS.READY && booking.zip_file_key) {
            try {
                // Gunakan S3Service untuk membuat URL yang aman (valid 7 hari)
                const downloadUrl = await S3Service.getSignedUrl(booking.zip_file_key, 604800); // 7 hari
                statusData.downloadUrl = downloadUrl;
                statusData.message = 'File ZIP siap diunduh.';
            } catch (error) {
                logger.error(`Gagal generate signed URL untuk ZIP key ${booking.zip_file_key}:`, error);
                statusData.status = ZIP_STATUS.FAILED; // Set status FAILED jika URL gagal
                statusData.message = 'Gagal menghasilkan link download. Silakan coba memicu ulang.';
            }
        } else if (booking.zip_status === ZIP_STATUS.PENDING) {
            // Dorong pengguna untuk memicu proses ZIP
            statusData.message = 'File ZIP belum diproses. Silakan klik tombol UNDUH untuk memulai.';
        } else if (booking.zip_status === ZIP_STATUS.FAILED) {
            statusData.message = 'Pembuatan ZIP gagal. Silakan coba memicu ulang atau hubungi Admin.';
        }

        return statusData;
    }
}

module.exports = new PhotoService();
