const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');

// Definisikan status booking di satu tempat untuk konsistensi
const BOOKING_STATUS = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAID',
    COMPLETED: 'COMPLETED', // Status baru untuk menandai sesi telah selesai
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
    FAILED: 'FAILED'
};

class BookingService {

    // =================================================================
    // FUNGSI UNTUK PELANGGAN (CUSTOMER-FACING)
    // =================================================================

    /**
     * Mengecek slot waktu yang tersedia pada cabang dan tanggal tertentu.
     */
    async checkAvailability(branchId, date) {
        // Logika untuk mengambil jam operasional cabang
        const result = await db.query('SELECT operating_hours FROM phourto.branches WHERE id = $1', [branchId]);
        if (result.rows.length === 0) {
            throw new ApiError(404, 'Cabang tidak ditemukan.');
        }

        // TODO: Buat logika generator slot yang lebih canggih berdasarkan operating_hours
        const allSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

        const query = `
            SELECT TO_CHAR(booking_time, 'HH24:MI') as booked_slot
            FROM phourto.bookings
            WHERE branch_id = $1 AND DATE(booking_time) = $2 AND status IN ('PAID', 'PENDING_PAYMENT')
        `;
        const bookedResult = await db.query(query, [branchId, date]);
        const bookedSlots = bookedResult.rows.map(row => row.booked_slot);

        return allSlots.filter(slot => !bookedSlots.includes(slot));
    }

    /**
     * Membuat booking baru (status awal: PENDING_PAYMENT).
     */
    async createBooking(userId, bookingData) {
        const { package_id, branch_id, booking_time } = bookingData;

        // Validasi dasar, validator di rute akan menangani sisanya
        if (!package_id || !branch_id || !booking_time) {
            throw new ApiError(400, 'Data booking tidak lengkap.');
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const packageResult = await client.query('SELECT price FROM phourto.packages WHERE id = $1', [package_id]);
            if (packageResult.rows.length === 0) throw new ApiError(404, 'Paket tidak ditemukan.');
            const totalAmount = packageResult.rows[0].price;

            const availabilityCheck = await client.query(
                `SELECT id FROM phourto.bookings WHERE branch_id = $1 AND booking_time = $2 AND status IN ('PAID', 'PENDING_PAYMENT')`,
                [branch_id, booking_time]
            );
            if (availabilityCheck.rows.length > 0) {
                throw new ApiError(409, 'Slot waktu sudah terisi. Silakan pilih waktu lain.');
            }

            const newBookingResult = await client.query(
                `INSERT INTO phourto.bookings (user_id, branch_id, package_id, booking_time, total_amount, status)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [userId, branch_id, package_id, booking_time, totalAmount, BOOKING_STATUS.PENDING_PAYMENT]
            );

            await client.query('COMMIT');
            return newBookingResult.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err; // Biarkan asyncHandler yang menangkap
        } finally {
            client.release();
        }
    }

    /**
     * Mengambil riwayat booking milik pengguna dengan pagination.
     */
    async getMyBookings(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT b.id, b.booking_time, b.status, b.total_amount, p.name as package_name, br.name as branch_name
            FROM phourto.bookings b
            JOIN phourto.packages p ON b.package_id = p.id
            JOIN phourto.branches br ON b.branch_id = br.id
            WHERE b.user_id = $1 ORDER BY b.booking_time DESC LIMIT $2 OFFSET $3
        `;
        const result = await db.query(query, [userId, limit, offset]);

        const countQuery = `SELECT COUNT(*) FROM phourto.bookings WHERE user_id = $1`;
        const countResult = await db.query(countQuery, [userId]);
        const total = parseInt(countResult.rows[0].count, 10);

        return {
            data: result.rows,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    /**
     * Mengambil detail satu booking milik pengguna.
     */
    async getBookingById(bookingId, userId) {
        const query = `
            SELECT b.*, p.name as package_name, br.name as branch_name
            FROM phourto.bookings b
            JOIN phourto.packages p ON b.package_id = p.id
            JOIN phourto.branches br ON b.branch_id = br.id
            WHERE b.id = $1 AND b.user_id = $2
        `;
        const result = await db.query(query, [bookingId, userId]);
        if (result.rows.length === 0) {
            throw new ApiError(404, 'Booking tidak ditemukan atau Anda tidak memiliki akses.');
        }
        return result.rows[0];
    }

    // =================================================================
    // FUNGSI UNTUK ADMIN
    // =================================================================

    /**
     * Mengambil semua data booking dari semua pengguna dengan pagination.
     */
    async getAllBookings(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const dataQuery = `
            SELECT b.id, b.booking_time, b.status, b.total_amount, u.full_name as customer_name,
            p.name as package_name, br.name as branch_name
            FROM phourto.bookings b
            JOIN phourto.users u ON b.user_id = u.id
            JOIN phourto.packages p ON b.package_id = p.id
            JOIN phourto.branches br ON b.branch_id = br.id
            ORDER BY b.booking_time DESC LIMIT $1 OFFSET $2
        `;
        const result = await db.query(dataQuery, [limit, offset]);

        const countQuery = `SELECT COUNT(*) FROM phourto.bookings`;
        const countResult = await db.query(countQuery);
        const total = parseInt(countResult.rows[0].count, 10);

        return {
            data: result.rows,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    /**
     * Memperbarui status sebuah booking. (Dipanggil oleh Admin)
     */
    async updateBookingStatusByAdmin(bookingId, status) {
        const validStatuses = Object.values(BOOKING_STATUS);
        if (!validStatuses.includes(status)) {
            throw new ApiError(400, `Status '${status}' tidak valid.`);
        }
        const query = `UPDATE phourto.bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
        const result = await db.query(query, [status, bookingId]);
        if (result.rows.length === 0) {
            throw new ApiError(404, `Gagal memperbarui. Booking dengan ID ${bookingId} tidak ditemukan.`);
        }
        return result.rows[0];
    }


    // =================================================================
    // FUNGSI INTERNAL (DIPANGGIL OLEH SERVICE LAIN)
    // =================================================================

    /**
     * Memproses booking yang pembayarannya berhasil. Dipanggil oleh PaymentService.
     */
    async finalizeSuccessfulBooking(bookingId, client) {
        const dbClient = client || db; // Gunakan client dari transaksi jika ada
        await dbClient.query("UPDATE phourto.bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [BOOKING_STATUS.PAID, bookingId]);
        
        const uniqueCode = `PHR-${Date.now()}-${bookingId}`;
        await dbClient.query('UPDATE phourto.bookings SET unique_code = $1 WHERE id = $2', [uniqueCode, bookingId]);
        
        logger.info(`Booking ${bookingId} finalized with unique code: ${uniqueCode}.`);
    }

    /**
     * Memperbarui status booking. Dipanggil oleh PaymentService untuk status gagal/expire.
     */
    async updateBookingStatus(bookingId, status, client) {
        const dbClient = client || db;
        const result = await dbClient.query("UPDATE phourto.bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *", [status, bookingId]);
        return result.rows[0];
    }
}

module.exports = new BookingService();