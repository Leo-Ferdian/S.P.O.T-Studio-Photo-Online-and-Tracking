const db = require('../../config/database'); // Koneksi database V1.6
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');

/**
 * --- REFACTORED FOR V1.6 SCHEMA ---
 * Menggunakan 'branch_id' (UUID), 'branch_name', 'address', 'open_hours'.
 * Menghapus 'city' (tidak ada di skema V1.6).
 * Menghapus 'phourto.' (ditangani oleh search_path di config/database.js).
 */
class BranchService {
    /**
     * Ambil semua cabang studio
     * @returns {Array} Daftar cabang
     */
    async getAllBranches() {
        try {
            // PERUBAHAN: Menyesuaikan nama kolom V1.6
            const query = `
                SELECT branch_id, branch_name, address, open_hours, created_at
                FROM branches
                ORDER BY branch_name ASC
            `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            logger.error('DB Error (getAllBranches):', error);
            throw new ApiError('Gagal mengambil data cabang dari database.', 500);
        }
    }

    /**
     * Ambil detail cabang berdasarkan ID
     * @param {string} branchId - Sekarang berupa UUID
     * @returns {object} Data cabang
     */
    async getBranchById(branchId) {
        try {
            // PERUBAHAN: Menyesuaikan nama kolom V1.6
            const query = `
                SELECT branch_id, branch_name, address, open_hours, created_at
                FROM branches
                WHERE branch_id = $1
            `;
            const result = await db.query(query, [branchId]);

            if (result.rows.length === 0) {
                throw new ApiError(`Cabang dengan ID ${branchId} tidak ditemukan.`, 404);
            }
            return result.rows[0];
        } catch (error) {
            // ... (Error handling Anda sudah bagus) ...
            if (error instanceof ApiError) throw error;
            logger.error('DB Error (getBranchById):', error);
            throw new ApiError('Terjadi kesalahan saat mengambil detail cabang.', 500);
        }
    }

    // --- FUNGSI ADMIN (DISESUAIKAN V1.6) ---

    /**
     * Membuat cabang studio baru. (Admin)
     */
    async createBranch(branchData) {
        // PERUBAHAN: Menyesuaikan V1.6 (menghapus 'city', menambah 'open_hours')
        const { branch_name, address, open_hours } = branchData;
        try {
            const query = `
                INSERT INTO branches (branch_name, address, open_hours)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await db.query(query, [branch_name, address, open_hours]);
            return result.rows[0];
        } catch (error) {
            logger.error('DB Error (createBranch):', error);
            // Cek jika error karena duplikasi (jika Anda menambahkan UNIQUE constraint)
            if (error.code === '23505') { // 23505 = unique_violation
                throw new ApiError('Gagal membuat cabang. Nama cabang mungkin sudah ada.', 409);
            }
            throw new ApiError('Gagal membuat cabang baru di database.', 500);
        }
    }

    /**
     * Memperbarui cabang studio yang ada. (Admin)
     */
    async updateBranch(branchId, updateData) {
        // PERUBAHAN: Menyesuaikan V1.6
        const { branch_name, address, open_hours } = updateData;
        try {
            const query = `
                UPDATE branches
                SET branch_name = $1, address = $2, open_hours = $3, updated_at = CURRENT_TIMESTAMP
                WHERE branch_id = $4
                RETURNING *
            `;
            const result = await db.query(query, [branch_name, address, open_hours, branchId]);

            if (result.rows.length === 0) {
                throw new ApiError(`Gagal memperbarui. Cabang dengan ID ${branchId} tidak ditemukan.`, 404);
            }
            return result.rows[0];
        } catch (error) {
            // ... (Error handling Anda sudah bagus) ...
            if (error instanceof ApiError) throw error;
            logger.error('DB Error (updateBranch):', error);
            throw new ApiError('Gagal memperbarui data cabang di database.', 500);
        }
    }

    /**
     * Menghapus cabang studio. (Admin)
     */
    async deleteBranch(branchId) {
        try {
            // PERUBAHAN: 'id' -> 'branch_id'
            const query = 'DELETE FROM branches WHERE branch_id = $1';
            const result = await db.query(query, [branchId]);

            if (result.rowCount === 0) {
                throw new ApiError(`Gagal menghapus. Cabang dengan ID ${branchId} tidak ditemukan.`, 404);
            }
            // Kirim status sukses (tidak ada data untuk dikembalikan)
            return { message: `Cabang ${branchId} berhasil dihapus.` };
        } catch (error) {
            if (error instanceof ApiError) throw error;

            // PERUBAHAN: Error handling yang lebih baik
            // Error 23503 = foreign_key_violation (melanggar 'ON DELETE RESTRICT')
            if (error.code === '23503') {
                logger.error('DB Error (deleteBranch): Gagal karena foreign key constraint.', error.detail);
                throw new ApiError('Gagal menghapus. Pastikan tidak ada Ruangan (Room) yang terhubung dengan cabang ini.', 409); // 409 Conflict
            }

            logger.error('DB Error (deleteBranch):', error);
            throw new ApiError('Gagal menghapus data cabang dari database.', 500);
        }
    }
}

module.exports = new BranchService();
