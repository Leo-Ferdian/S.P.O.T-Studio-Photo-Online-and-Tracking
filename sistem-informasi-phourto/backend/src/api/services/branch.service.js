const db = require('../../config/database'); // Koneksi database
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger'); // Menggunakan logger yang sudah kita buat

class BranchService {
    /**
     * Ambil semua cabang studio
     * @returns {Array} Daftar cabang
     */
    async getAllBranches() {
        // FUNGSI INI SUDAH SANGAT BAIK, TIDAK PERLU DIUBAH
        try {
            const query = `
                SELECT id, name, address, city, created_at, updated_at
                FROM phourto.branches
                ORDER BY name ASC
            `;
            const result = await db.query(query);
            return result.rows; // <-- BENAR (mengembalikan array)
        } catch (error) {
            logger.error('DB Error (getAllBranches):', error);
            throw new ApiError('Gagal mengambil data cabang dari database.', 500);
        }
    }

    /**
     * Ambil detail cabang berdasarkan ID
     * @param {number} branchId
     * @returns {object} Data cabang
     */
    async getBranchById(branchId) {
        try {
            const query = `
                SELECT id, name, address, city, created_at, updated_at
                FROM phourto.branches
                WHERE id = $1
            `;
            const result = await db.query(query, [branchId]);

            if (result.rows.length === 0) {
                throw new ApiError(`Cabang dengan ID ${branchId} tidak ditemukan.`, 404);
            }

            return result.rows[0]; // <-- PERBAIKAN: Kembalikan objek pertama
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            logger.error('DB Error (getBranchById):', error);
            throw new ApiError('Terjadi kesalahan saat mengambil detail cabang.', 500);
        }
    }

    // --- FUNGSI BARU UNTUK CRUD ADMIN ---

    /**
     * Membuat cabang studio baru. (Admin)
     * @param {object} branchData - Data cabang dari request body.
     * @returns {object} - Data cabang yang baru dibuat.
     */
    async createBranch(branchData) {
        const { name, address, city } = branchData;
        try {
            const query = `
                INSERT INTO phourto.branches (name, address, city)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await db.query(query, [name, address, city]);
            return result.rows[0]; // <-- PERBAIKAN: Kembalikan objek pertama
        } catch (error) {
            logger.error('DB Error (createBranch):', error);
            throw new ApiError('Gagal membuat cabang baru di database.', 500);
        }
    }

    /**
     * Memperbarui cabang studio yang ada. (Admin)
     * @param {number} branchId - ID dari cabang yang akan diperbarui.
     * @param {object} updateData - Data yang akan diperbarui.
     * @returns {object} - Data cabang yang sudah diperbarui.
     */
    async updateBranch(branchId, updateData) {
        const { name, address, city } = updateData;
        try {
            const query = `
                UPDATE phourto.branches
                SET name = $1, address = $2, city = $3, updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *
            `;
            const result = await db.query(query, [name, address, city, branchId]);

            if (result.rows.length === 0) {
                throw new ApiError(`Gagal memperbarui. Cabang dengan ID ${branchId} tidak ditemukan.`, 404);
            }
            return result.rows[0]; // <-- PERBAIKAN: Kembalikan objek pertama
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            logger.error('DB Error (updateBranch):', error);
            throw new ApiError('Gagal memperbarui data cabang di database.', 500);
        }
    }

    /**
     * Menghapus cabang studio. (Admin)
     * @param {number} branchId - ID dari cabang yang akan dihapus.
     */
    async deleteBranch(branchId) {
        // FUNGSI INI SUDAH SANGAT BAIK, TIDAK PERLU DIUBAH
        try {
            const query = 'DELETE FROM phourto.branches WHERE id = $1';
            const result = await db.query(query, [branchId]);

            if (result.rowCount === 0) {
                throw new ApiError(`Gagal menghapus. Cabang dengan ID ${branchId} tidak ditemukan.`, 404);
            }
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            logger.error('DB Error (deleteBranch):', error);
            throw new ApiError('Gagal menghapus data cabang dari database.', 500);
        }
    }
}

module.exports = new BranchService();