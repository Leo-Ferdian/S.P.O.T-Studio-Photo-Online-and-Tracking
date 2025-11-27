const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const S3Service = require('./s3.service');
const BookingService = require('./booking.service');
const { logger } = require('../../utils/logger');
const { BOOKING_STATUS } = require('../../config/constants');
const path = require('path');
const fs = require('fs');

// --- LIBRARY BARU UNTUK STREAMING ZIP ---
const archiver = require('archiver');
const axios = require('axios');
// ----------------------------------------

class PhotoService {
    /**
     * (Refactored V1.14 - Hybrid Approach)
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

            // 1. Dapatkan status booking saat ini
            const bookingCheck = await client.query(
                'SELECT 1 FROM bookings WHERE booking_id = $1 FOR UPDATE',
                [bookingId]
            );
            if (bookingCheck.rows.length === 0) {
                throw new ApiError(404, 'Booking tidak ditemukan.');
            }
            // Kita ambil info user & package untuk email nanti
            const fullBookingInfo = await client.query(
                'SELECT user_id, package_id, unique_code FROM bookings WHERE booking_id = $1',
                [bookingId]
            );
            const bookingInfo = fullBookingInfo.rows[0];

            // 2. Loop dan INSERT setiap file ke tabel 'photos'
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

            // 3. Panggil 'updateBookingStatusByAdmin' (Mengubah status -> COMPLETED)
            await BookingService.updateBookingStatusByAdmin(
                bookingId,
                BOOKING_STATUS.COMPLETED,
                adminUserId,
                client // Meneruskan klien transaksi
            );

            await client.query('COMMIT');
            logger.info(`Transaksi berhasil: ${insertedPhotos.length} foto ditambahkan ke ${bookingId}.`);

            // --- LANGKAH 4: KIRIM EMAIL KLAIM FOTO ---
            this.sendClaimEmail(bookingInfo).catch(err =>
                logger.error(`Gagal mengirim email KLAIM FOTO untuk booking ${bookingId}:`, err)
            );

            return insertedPhotos;

        } catch (error) {
            await client.query('ROLLBACK');
            logger.warn(`Database insert gagal (addPhotosToBooking), memulai proses rollback S3...`);
            try {
                const deletePromises = files.map(file => S3Service.deleteFile(file.key));
                await Promise.all(deletePromises);
            } catch (s3Error) {
                logger.error('KRITIS: Gagal melakukan rollback S3!', s3Error);
            }
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, `Gagal menyimpan foto ke database. Error: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * @function getGalleryByBookingId
     * @desc Mengambil detail booking dan semua foto terkait (untuk admin)
     * @param {string} bookingId - UUID booking
     * @returns {Promise<object>} Objek berisi { booking, photos }
     */
    async getGalleryByBookingId(bookingId) {
        try {
            // --- 1. Ambil Detail Booking ---
            const bookingQuery = `
            SELECT 
                b.booking_id, 
                b.payment_status,
                b.start_time,
                b.total_price,
                b.amount_paid,
                u.full_name AS customer_name,
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

            // --- 2. Ambil Daftar Foto (file_url publik) ---
            const photosQuery = `
            SELECT
                photo_id,
                file_name_original,
                file_url
            FROM photos
            WHERE booking_id = $1
            ORDER BY uploaded_at ASC;
        `;

            const photosResult = await db.query(photosQuery, [bookingId]);

            const photosData = photosResult.rows.map(photo => ({
                photo_id: photo.photo_id,
                url: photo.file_url, // URL publik langsung dari DB
                name: photo.file_name_original
            }));

            // --- 3. Return Data Lengkap ---
            return {
                booking: bookingData,
                photos: photosData
            };

        } catch (error) {
            logger.error('Error in getGalleryByBookingId (Admin):', error);

            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(
                error.message || 'Gagal mengambil data galeri dari database.',
                500
            );
        }
    }


    /**
     * Helper: Mengirim Email Klaim dengan Template HTML
     */
    async sendClaimEmail(info) {
        try {
            const templatePath = path.join(__dirname, '../../templates', 'claim_photo_template.html');

            let htmlContent = fs.readFileSync(templatePath, 'utf8');

            let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

            if (frontendUrl.endsWith('/')) {
                frontendUrl = frontendUrl.slice(0, -1);
            }
            if (!frontendUrl.startsWith('http')) {
                frontendUrl = 'http://' + frontendUrl;
            }

            const magicLink = `${frontendUrl}/booking/ClaimResult?code=${encodeURIComponent(info.unique_code)}&email=${encodeURIComponent(info.email)}`;

            console.log("GENERATED CLAIM URL:", magicLink);

            htmlContent = htmlContent.replace(/\{\{\s*CUSTOMER_NAME\s*\}\}/g, info.full_name || 'Pelanggan');
            htmlContent = htmlContent.replace(/\{\{\s*PACKAGE_NAME\s*\}\}/g, info.package_name || 'Sesi Pemotretan Anda');
            htmlContent = htmlContent.replace(/\{\{\s*CLAIM_CODE\s*\}\}/g, info.unique_code || 'N/A');
            htmlContent = htmlContent.replace(/\{\{\s*CLAIM_URL\s*\}\}/g, magicLink);

            const EmailService = require('./email.service');

            await EmailService.sendEmail({
                to: info.email,
                subject: `Foto Anda Siap! - Kode: ${info.unique_code}`,
                html: htmlContent
            });

            if (typeof logger !== 'undefined') {
                logger.info(`Email klaim foto terkirim ke ${info.email}`);
            }

        } catch (error) {
            if (typeof logger !== 'undefined') {
                logger.error("Error sending claim email:", error);
            } else {
                console.error("Error sending claim email:", error);
            }
        }
    }

    /**
     * (Internal Use) Ambil hanya array foto
     */
    async getPhotosByBooking(bookingId, userId) {
        const bookingQuery = `SELECT booking_id, payment_status FROM bookings WHERE booking_id = $1 AND user_id = $2`;
        const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

        if (bookingResult.rows.length === 0) {
            throw new ApiError(403, "Akses ditolak. Booking tidak ditemukan atau bukan milik Anda.");
        }

        const query = `
            SELECT photo_id, file_url as photo_url, file_name_original as file_name
            FROM photos
            WHERE booking_id = $1
            ORDER BY uploaded_at ASC
        `;

        const result = await db.query(query, [bookingId]);
        return result.rows;
    }

    /**
     * [BARU] Ambil Galeri BESERTA Detail Booking (Paket, Tanggal, Cabang)
     * Digunakan untuk respon JSON ke Frontend ClaimResult
     */
    async getGalleryWithDetails(bookingId, userId) {
        // 1. Ambil Detail Booking + Paket + Cabang
        // PERBAIKAN: Join ke 'rooms' dulu baru ke 'branches'
        const bookingQuery = `
            SELECT 
                b.booking_id, 
                b.unique_code, 
                b.start_time, 
                b.payment_status,
                p.package_name,
                br.branch_name
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            JOIN rooms r ON p.room_id = r.room_id 
            JOIN branches br ON r.branch_id = br.branch_id
            WHERE b.booking_id = $1 AND b.user_id = $2
        `;

        const bookingResult = await db.query(bookingQuery, [bookingId, userId]);

        if (bookingResult.rows.length === 0) {
            throw new ApiError(403, "Akses ditolak. Booking tidak ditemukan atau bukan milik Anda.");
        }

        const bookingData = bookingResult.rows[0];

        // 2. Ambil Foto
        const photos = await this.getPhotosByBooking(bookingId, userId);

        // 3. Gabungkan
        return {
            booking: bookingData, // Info Paket, Tanggal, Cabang
            photos: photos        // Array Foto
        };
    }

    /**
     * (V1.14 - Hybrid) Stream ZIP
     */
    async streamZipToClient(bookingId, userId, res) {
        const photos = await this.getPhotosByBooking(bookingId, userId);

        if (photos.length === 0) {
            throw new ApiError(404, 'Tidak ada foto untuk diunduh.');
        }

        const filename = `PHOURTO-${bookingId.substring(0, 8)}.zip`;
        res.attachment(filename);
        res.setHeader('Content-Type', 'application/zip');

        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', (err) => {
            logger.error('Archiver Error:', err);
            if (!res.headersSent) res.status(500).send({ message: 'Gagal membuat file ZIP.' });
        });

        archive.pipe(res);

        for (const photo of photos) {
            try {
                const imageResponse = await axios.get(photo.photo_url, { responseType: 'stream' });
                archive.append(imageResponse.data, { name: photo.file_name || `photo-${Date.now()}.jpg` });
            } catch (error) {
                logger.warn(`Gagal mengunduh foto ${photo.photo_url} untuk ZIP: ${error.message}`);
            }
        }

        await archive.finalize();
    }

    /**
     * (V1.15 - Single Download Proxy)
     * Mengunduh satu foto dari URL S3 dan meneruskannya ke klien.
     * Ini mengatasi masalah CORS pada browser.
     */
    async streamSingleFileToClient(bookingId, userId, photoUrl, res) {
        // 1. Validasi: Pastikan foto ini benar-benar milik booking tersebut
        const photos = await this.getPhotosByBooking(bookingId, userId);

        const targetPhoto = photos.find(p => p.photo_url === photoUrl);

        if (!targetPhoto) {
            throw new ApiError(404, 'Foto tidak ditemukan dalam booking ini.');
        }

        // 2. Set Header agar browser langsung download
        res.attachment(targetPhoto.file_name);

        // 3. Stream dari sumber (S3/Cloudinary) ke Client
        try {
            const response = await axios.get(targetPhoto.photo_url, { responseType: 'stream' });
            response.data.pipe(res);
        } catch (error) {
            logger.error(`Gagal streaming single photo: ${error.message}`);
            throw new ApiError(502, 'Gagal mengunduh foto dari server penyimpanan.');
        }
    }
}

module.exports = new PhotoService();