const db = require('../../config/database');

// Enum status booking agar tidak hardcode
const BOOKING_STATUS = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
};

class BookingService {
    /**
     * Mengecek slot waktu yang tersedia pada cabang dan tanggal tertentu.
     * @param {number} branchId - ID dari cabang studio.
     * @param {string} date - Tanggal dalam format 'YYYY-MM-DD'.
     * @returns {Array<string>} - Array berisi slot waktu yang tersedia (e.g., "10:00", "11:00").
     */
    async checkAvailability(branchId, date) {
        // TODO: idealnya jam operasional diambil dari tabel branches
        const allSlots = [
            '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
            '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
        ];

        const query = `
            SELECT TO_CHAR(booking_time, 'HH24:MI') as booked_slot
            FROM phourto.bookings
            WHERE branch_id = $1 
            AND DATE(booking_time) = $2
            AND status IN ($3, $4)
        `;
        const result = await db.query(query, [branchId, date, BOOKING_STATUS.PAID, BOOKING_STATUS.PENDING_PAYMENT]);
        const bookedSlots = result.rows.map(row => row.booked_slot);

        return allSlots.filter(slot => !bookedSlots.includes(slot));
    }

    /**
     * Membuat booking baru untuk pengguna.
     * @param {number} userId - ID pengguna dari token JWT.
     * @param {object} bookingData - Data booking dari request body.
     * @returns {object} - Data booking & info pembayaran.
     */
    async createBooking(userId, bookingData) {
        const { package_id, branch_id, booking_time } = bookingData;

        // Gunakan transaction untuk menghindari race condition
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Ambil harga paket
            const packageResult = await client.query(
                'SELECT price FROM phourto.packages WHERE id = $1',
                [package_id]
            );
            if (packageResult.rows.length === 0) {
                const error = new Error('Paket tidak ditemukan.');
                error.statusCode = 404;
                throw error;
            }
            const totalAmount = packageResult.rows[0].price;

            // 2. Cek slot ketersediaan
            const availabilityCheck = await client.query(
                `SELECT id 
                FROM phourto.bookings 
                WHERE branch_id = $1 AND booking_time = $2 
                AND status IN ($3, $4)`,
                [branch_id, booking_time, BOOKING_STATUS.PAID, BOOKING_STATUS.PENDING_PAYMENT]
            );
            if (availabilityCheck.rows.length > 0) {
                const error = new Error('Maaf, slot waktu ini baru saja dipesan. Silakan pilih waktu lain.');
                error.statusCode = 409;
                throw error;
            }

            // 3. Insert booking baru
            const newBookingResult = await client.query(
                `INSERT INTO phourto.bookings 
                (user_id, branch_id, package_id, booking_time, total_amount, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [userId, branch_id, package_id, booking_time, totalAmount, BOOKING_STATUS.PENDING_PAYMENT]
            );
            const newBooking = newBookingResult.rows[0];

            await client.query('COMMIT');

            // --- Placeholder Payment Gateway ---
            const paymentInfo = {
                is_mock: true,
                qr_code_url: `https://api.paymentgateway.com/qris/${newBooking.id}`,
                expires_at: new Date(Date.now() + 15 * 60 * 1000) // Kedaluwarsa 15 menit
            };
            // ----------------------------------

            return { booking: newBooking, paymentInfo };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Mengambil riwayat booking milik pengguna dengan pagination.
     * @param {number} userId - ID pengguna.
     * @param {number} page - Halaman (default 1).
     * @param {number} limit - Jumlah per halaman (default 10).
     * @returns {object} - Data booking + info pagination.
     */
    async getMyBookings(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const query = `
            SELECT b.id, b.booking_time, b.status, b.total_amount, 
            p.name as package_name, br.name as branch_name
            FROM phourto.bookings b
            JOIN phourto.packages p ON b.package_id = p.id
            JOIN phourto.branches br ON b.branch_id = br.id
            WHERE b.user_id = $1
            ORDER BY b.booking_time DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await db.query(query, [userId, limit, offset]);

        const countQuery = `SELECT COUNT(*) FROM phourto.bookings WHERE user_id = $1`;
        const countResult = await db.query(countQuery, [userId]);
        const total = parseInt(countResult.rows[0].count, 10);

        return {
            data: result.rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Mengambil detail satu booking milik pengguna.
     * @param {number} bookingId - ID booking.
     * @param {number} userId - ID pengguna.
     * @returns {object} - Detail booking.
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
            const error = new Error('Booking tidak ditemukan atau Anda tidak memiliki akses.');
            error.statusCode = 404;
            throw error;
        }
        return result.rows[0];
    }
}

module.exports = new BookingService();
