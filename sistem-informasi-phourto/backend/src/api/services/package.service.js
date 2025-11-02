const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');

class PackageService {

    /**
     * Mengambil SEMUA paket dari SEMUA cabang.
     * Ini adalah query "Katalog Lengkap" Anda.
     * @returns {Array} Daftar paket lengkap dengan info ruangan & cabang.
     */
    async getAllPackages() {
        try {
            // Ini adalah query JOIN 3-tabel untuk mendapatkan katalog
            const query = `
                SELECT 
                    p.package_id,
                    p.package_name,
                    p.price,
                    p.price_type,
                    p.duration,
                    p.duration_in_minutes,
                    p.inclusions,
                    p.capacity,
                    r.room_id,
                    r.room_name_display,
                    b.branch_id,
                    b.branch_name,
                    b.address
                FROM packages p
                JOIN rooms r ON p.room_id = r.room_id
                JOIN branches b ON r.branch_id = b.branch_id
                ORDER BY b.branch_name, r.room_name_display, p.package_name;
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            logger.error('DB Error (getAllPackages):', error);
            throw new ApiError('Gagal mengambil katalog paket dari database.', 500);
        }
    }

    /**
     * Mengambil satu paket detail berdasarkan ID,
     * TERMASUK semua add-on yang terhubung.
     * @param {string} packageId - ID dari paket (UUID).
     * @returns {object} - Data paket tunggal dengan array addons.
     */
    async getPackageById(packageId) {
        try {
            // Query 1: Ambil detail paket (JOIN 3-tabel)
            const packageQuery = `
                SELECT 
                    p.package_id, p.package_name, p.price, p.price_type, p.duration,
                    p.duration_in_minutes, p.inclusions, p.capacity,
                    r.room_id, r.room_name_display,
                    b.branch_id, b.branch_name, b.address
                FROM packages p
                JOIN rooms r ON p.room_id = r.room_id
                JOIN branches b ON r.branch_id = b.branch_id
                WHERE p.package_id = $1;
            `;
            const packageResult = await db.query(packageQuery, [packageId]);

            if (packageResult.rows.length === 0) {
                throw new ApiError(`Paket dengan ID ${packageId} tidak ditemukan.`, 404);
            }

            const packageData = packageResult.rows[0];

            // Query 2: Ambil semua add-on untuk paket ini
            const addonsQuery = `
                SELECT addon_id, addon_name, addon_price, addon_unit, max_qty
                FROM addons
                WHERE package_id = $1
                ORDER BY addon_price;
            `;
            const addonsResult = await db.query(addonsQuery, [packageId]);

            // Gabungkan hasilnya
            packageData.addons = addonsResult.rows;

            return packageData;

        } catch (error) {
            if (error instanceof ApiError) throw error;
            logger.error('DB Error (getPackageById):', error);
            throw new ApiError('Terjadi kesalahan saat mengambil detail paket.', 500);
        }
    }

    // --- FUNGSI ADMIN (DITULIS ULANG V1.6) ---

    /**
     * Membuat paket foto baru. (Admin)
     * @param {object} packageData - Data paket dari request body.
     * @returns {object} - Data paket yang baru dibuat.
     */
    async createFullPackage(packageData) {
        // PERUBAHAN: Kolom disesuaikan dengan skema V1.6
        const {
            room_id,  // WAJIB ada
            package_name,
            capacity,
            duration,
            inclusions,
            price,
            price_type,
            duration_in_minutes
        } = packageData;

        // Validasi sederhana (bisa diperkuat di validator.js)
        if (!room_id || !package_name || !price || !duration_in_minutes) {
            throw new ApiError('room_id, package_name, price, dan duration_in_minutes wajib diisi.', 400);
        }

        try {
            const query = `
                INSERT INTO packages (
                    room_id, package_name, capacity, duration, inclusions, 
                    price, price_type, duration_in_minutes
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *`;

            const result = await db.query(query, [
                room_id, package_name, capacity, duration, inclusions,
                price, price_type, duration_in_minutes
            ]);
            return result.rows[0];
        } catch (error) {
            // Error 23503 = foreign_key_violation
            if (error.code === '23503') {
                logger.error('DB Error (createPackage): Gagal karena room_id tidak valid.', error.detail);
                throw new ApiError(`Gagal membuat paket. Ruangan (room_id) ${room_id} tidak ditemukan.`, 400);
            }
            logger.error('DB Error (createPackage):', error);
            throw new ApiError('Gagal membuat paket baru di database.', 500);
        }
    }

    /**
     * Memperbarui paket foto yang ada. (Admin)
     */
    async updatePackage(packageId, updateData) {
        const {
            room_id, package_name, capacity, duration, inclusions,
            price, price_type, duration_in_minutes
        } = updateData;

        try {
            const query = `
                UPDATE packages
                SET 
                    room_id = $1,
                    package_name = $2,
                    capacity = $3,
                    duration = $4,
                    inclusions = $5,
                    price = $6,
                    price_type = $7,
                    duration_in_minutes = $8,
                    updated_at = CURRENT_TIMESTAMP
                WHERE package_id = $9
                RETURNING *`;

            const result = await db.query(query, [
                room_id, package_name, capacity, duration, inclusions,
                price, price_type, duration_in_minutes,
                packageId
            ]);

            if (result.rows.length === 0) {
                throw new ApiError(`Gagal memperbarui. Paket dengan ID ${packageId} tidak ditemukan.`, 404);
            }
            return result.rows[0];
        } catch (error) {
            if (error instanceof ApiError) throw error;
            // Error 23503 = foreign_key_violation
            if (error.code === '23503') {
                logger.error('DB Error (updatePackage): Gagal karena room_id tidak valid.', error.detail);
                throw new ApiError(`Gagal memperbarui paket. Ruangan (room_id) ${room_id} tidak ditemukan.`, 400);
            }
            logger.error('DB Error (updatePackage):', error);
            throw new ApiError('Gagal memperbarui data paket di database.', 500);
        }
    }

    /**
     * Menghapus paket foto. (Admin)
     */
    async deletePackage(packageId) {
        try {
            // PERUBAHAN: 'id' -> 'package_id'
            const query = 'DELETE FROM packages WHERE package_id = $1';
            const result = await db.query(query, [packageId]);

            if (result.rowCount === 0) {
                throw new ApiError(`Gagal menghapus. Paket dengan ID ${packageId} tidak ditemukan.`, 404);
            }
            // Skema V1.6 memiliki 'ON DELETE CASCADE' untuk 'addons' & 'booking_addons'
            // Jadi, menghapus paket akan MENGHAPUS SEMUA add-on-nya secara otomatis.
            // PENTING: 'bookings' memiliki 'ON DELETE RESTRICT', jadi query ini
            // akan GAGAL jika paket sudah pernah dipesan. Ini adalah perilaku yang AMAN.
            return { message: `Paket ${packageId} dan add-on terkait berhasil dihapus.` };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            // Error 23503 = foreign_key_violation (melanggar 'ON DELETE RESTRICT' dari 'bookings')
            if (error.code === '23503') {
                logger.error('DB Error (deletePackage): Gagal karena foreign key constraint (bookings).', error.detail);
                throw new ApiError('Gagal menghapus. Paket ini sudah memiliki riwayat pemesanan (bookings).', 409);
            }
            logger.error('DB Error (deletePackage):', error);
            throw new ApiError('Gagal menghapus data paket dari database.', 500);
        }
    }
}

module.exports = new PackageService();