const RoomService = require('../../services/admin/room.service');
const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/apiResponse');
const ApiError = require('../../../utils/apiError');
const { validationResult } = require('express-validator');

class AdminRoomController {

    /**
     * @route GET /api/admin/rooms
     * @desc Mengambil semua ruangan
     * @access Admin
     */
    getAllRooms = asyncHandler(async (req, res) => {
        const rooms = await RoomService.getAllRooms();

        if (!rooms || rooms.length === 0) {
            throw new ApiError(404, 'Tidak ada data ruangan ditemukan.');
        }

        new ApiResponse(res, 200, rooms, 'Data semua ruangan berhasil diambil.');
    });

    // (Controller CRUD lainnya bisa ditambahkan di sini)
}

module.exports = new AdminRoomController();