const db = require('../../config/database');
const apiError = require('../../utils/apiError'); // Pastikan apiError diimpor

class PackageService {
    async getAllPackages() {
        const result = await db.query('SELECT * FROM phourto.packages ORDER BY id ASC');
        return result.rows;
    }

    /**
     * Mengambil satu paket berdasarkan ID.
     * @param {number} packageId - ID dari paket.
     * @returns {object} - Data paket.
     */
    async getPackageById(packageId) {
        const result = await db.query('SELECT * FROM phourto.packages WHERE id = $1', [packageId]);
        if (result.rows.length === 0) {
            throw new apiError (404, 'Paket dengan ID tersebut tidak ditemukan.');
        }
        return result.rows;
    }

    /**
     * Membuat paket foto baru.
     * @param {object} packageData - Data paket dari request body.
     * @returns {object} - Data paket yang baru dibuat.
     */
    async createPackage(packageData) {
        const { name, price, duration_minutes, description } = packageData;
        const result = await db.query(
            `INSERT INTO phourto.packages (name, price, duration_minutes, description)
            VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, price, duration_minutes, description]
        );
        return result.rows;
    }

    /**
     * Memperbarui paket foto yang ada.
     * @param {number} packageId - ID dari paket yang akan diperbarui.
     * @param {object} updateData - Data yang akan diperbarui.
     * @returns {object} - Data paket yang sudah diperbarui.
     */
    async updatePackage(packageId, updateData) {
        const { name, price, duration_minutes, description } = updateData;
        const result = await db.query(
            `UPDATE phourto.packages
            SET name = $1, price = $2, duration_minutes = $3, description = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
             RETURNING *`,
            [name, price, duration_minutes, description, packageId]
        );
        if (result.rows.length === 0) {
            throw new apiError (404, 'Gagal memperbarui. Paket dengan ID tersebut tidak ditemukan.');
        }
        return result.rows;
    }

    /**
     * Menghapus paket foto.
     * @param {number} packageId - ID dari paket yang akan dihapus.
     */
    async deletePackage(packageId) {
        const result = await db.query('DELETE FROM phourto.packages WHERE id = $1', [packageId]);
        if (result.rowCount === 0) {
            throw new apiError (404, 'Gagal menghapus. Paket dengan ID tersebut tidak ditemukan.');
        }
    }
}

module.exports = new PackageService();