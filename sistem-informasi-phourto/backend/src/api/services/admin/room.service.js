const db = require('../../../config/database');
const ApiError = require('../../../utils/apiError');
const { logger } = require('../../../utils/logger');

class RoomService {

    /**
     * @function getAllRooms
     * @desc Mengambil semua ruangan dari semua cabang (untuk form admin)
     */
    async getAllRooms() {
        try {
            // Kita JOIN dengan 'branches' untuk mendapatkan nama cabang
            const query = `
                SELECT 
                    r.room_id,
                    r.room_name_display,
                    r.branch_id,
                    b.branch_name
                FROM rooms r
                JOIN branches b ON r.branch_id = b.branch_id
                ORDER BY b.branch_name, r.room_name_display;
                `;
            const result = await db.query(query);
            return result.rows;
        } catch (error) {
            logger.error('Error in getAllRooms (Admin Service):', error);
            throw new ApiError('Gagal mengambil data ruangan dari database.', 500);
        }
    }

    // (Di masa depan, kita bisa tambahkan createRoom, updateRoom, deleteRoom di sini)
}

module.exports = new RoomService();