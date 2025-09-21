const db = require('../../config/database');
const apiError = require('../../utils/apiError');

class BranchService {
    /**
     * Ambil semua cabang studio
     * @returns {Array} Daftar cabang
     */
    async getAllBranches() {
        try {
            const query = `
                SELECT id, name, address, city, created_at, updated_at
                FROM phourto.branches
                ORDER BY name ASC
            `;
            const result = await db.query(query);

            return result.rows; // bisa kosong array []
        } catch (error) {
            // Log detail ke console / logger
            console.error('DB Error (getAllBranches):', error);

            // Lempar error supaya ditangani middleware
            throw new apiError('Gagal mengambil data cabang dari database.', 500);
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
                throw new apiError(`Cabang dengan ID ${branchId} tidak ditemukan.`, 404);
            }

            return result.rows[0];
        } catch (error) {
            console.error('DB Error (getBranchById):', error);
            if (error instanceof apiError) throw error; // biarkan apiError tetap utuh

            throw new apiError('Terjadi kesalahan saat mengambil detail cabang.', 500);
        }
    }
}

module.exports = new BranchService();
