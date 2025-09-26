const db = require('../../config/database');
const apiError = require('../../utils/apiError');
const logger = require('../../utils/logger');

// Enum status booking
const BOOKING_STATUS = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED',
    FAILED_PAYMENT: 'FAILED_PAYMENT'
};

class BookingService {
    /**
     * Generate slot operasional cabang (default 10:00 - 21:00 kalau tidak ada data).
     */
    async getBranchSlots(branchId) {
        const result = await db.query(
            'SELECT open_hour, close_hour FROM phourto.branches WHERE id = $1',
            [branchId]
        );

        if (result.rows.length === 0) {
            throw new apiError('Cabang tidak ditemukan.', 404);
        }

        const { open_hour, close_hour } = result.rows[0];
        const startHour = open_hour || '10:00';
        const endHour = close_hour || '21:00';

        // Generate slots tiap 1 jam
        const slots = [];
        let current = parseInt(startHour.split(':')[0], 10);
        const end = parseInt(endHour.split(':')[0], 10);

        while (current <= end) {
            slots.push(`${String(current).padStart(2, '0')}:00`);
            current++;
        }

        return slots;
    }

    /**
     * Mengecek slot waktu yang tersedia pada cabang dan tanggal tertentu.
     */
    async checkAvailability(branchId, date) {
        const allSlots = await this.getBranchSlots(branchId);

        const query = `
            SELECT TO_CHAR(booking_time, 'HH24:MI') as booked_slot
            FROM phourto.bookings
            WHERE branch_id = $1 
            AND DATE(booking_time) = $2
            AND status IN ($3, $4)
        `;
        const result = await db.query(query, [
            branchId,
            date,
            BOOKING_STATUS.PAID,
            BOOKING_STATUS.PENDING_PAYMENT
        ]);

        const bookedSlots = result.rows.map(row => row.booked_slot);
        return allSlots.filter(slot => !bookedSlots.includes(slot));
    }

    /**
     * Membuat booking baru (status awal: PENDING_PAYMENT).
     */
    async createBooking(userId, bookingData) {
        const { package_id, branch_id, booking_time } = bookingData;

        if (!package_id || !branch_id || !booking_time) {
            throw new apiError('Data booking tidak lengkap.', 400);
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Ambil harga paket
            const packageResult = await client.query(
                'SELECT id, price FROM phourto.packages WHERE id = $1',
                [package_id]
            );
            if (packageResult.rows.length === 0) {
                throw new apiError('Paket tidak ditemukan.', 404);
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
                throw new apiError('Slot waktu sudah terisi. Silakan pilih waktu lain.', 409);
            }

            // 3. Insert booking baru dengan status PENDING_PAYMENT
            const newBookingResult = await client.query(
                `INSERT INTO phourto.bookings 
                (user_id, branch_id, package_id, booking_time, total_amount, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, user_id, branch_id, package_id, booking_time, total_amount, status`,
                [userId, branch_id, package_id, booking_time, totalAmount, BOOKING_STATUS.PENDING_PAYMENT]
            );

            const newBooking = newBookingResult.rows[0];
            await client.query('COMMIT');
            return newBooking;

        } catch (err) {
            await client.query('ROLLBACK');
            logger.error('CreateBooking failed:', err);
            throw err;
        } finally {
            client.release();
        }
    }
     /**
     * Mengambil semua data booking dari semua pengguna dengan pagination. (Admin)
     * @param {number} page - Halaman saat ini.
     * @param {number} limit - Jumlah data per halaman.
     * @returns {object} - Data booking beserta informasi pagination.
     */
    async getAllBookings(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        // Query untuk mengambil data booking dengan detail pengguna, paket, dan cabang
        const dataQuery = `
            SELECT
                b.id, b.booking_time, b.status, b.total_amount,
                u.full_name as customer_name, u.email as customer_email,
                p.name as package_name,
                br.name as branch_name
            FROM phourto.bookings b
            JOIN phourto.users u ON b.user_id = u.id
            JOIN phourto.packages p ON b.package_id = p.id
            JOIN phourto.branches br ON b.branch_id = br.id
            ORDER BY b.booking_time DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await db.query(dataQuery, [limit, offset]);

        // Query untuk menghitung total data untuk pagination
        const countQuery = `SELECT COUNT(*) FROM phourto.bookings`;
        const countResult = await db.query(countQuery);
        const total = parseInt(countResult.rows.count, 10);

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
     * Memperbarui status sebuah booking. (Admin)
     * @param {number} bookingId - ID dari booking yang akan diperbarui.
     * @param {string} status - Status baru untuk booking.
     * @returns {object} - Data booking yang sudah diperbarui.
     */
    async updateBookingStatusByAdmin(bookingId, status) {
        // Validasi apakah status yang diberikan valid sesuai ENUM kita
        const validStatuses = Object.values(BOOKING_STATUS);
        if (!validStatuses.includes(status)) {
            throw new ApiError(400, `Status '${status}' tidak valid.`);
        }

        const query = `
            UPDATE phourto.bookings
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        const result = await db.query(query, [status, bookingId]);

        if (result.rows.length === 0) {
            throw new ApiError(404, `Gagal memperbarui. Booking dengan ID ${bookingId} tidak ditemukan.`);
        }
        return result.rows;
    }


    /**
     * Simpan informasi pembayaran dari Midtrans.
     */
    async savePaymentInfo(bookingId, paymentData) {
        const query = `
            INSERT INTO phourto.payments 
            (booking_id, transaction_id, order_id, gross_amount, payment_type, payment_url, qr_code_url, expires_at, status)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`;
        const values = [
            bookingId,
            paymentData.transaction_id,
            paymentData.order_id,
            paymentData.gross_amount,
            paymentData.payment_type,
            paymentData.payment_url || null,
            paymentData.qr_code_url || null,
            paymentData.expires_at,
            paymentData.status || 'WAITING_PAYMENT'
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    /**
     * Update status booking (misalnya setelah payment sukses/expire).
     */
    async updateBookingStatus(bookingId, status) {
        const query = `
            UPDATE phourto.bookings
            SET status = $2
            WHERE id = $1
            RETURNING *`;
        const result = await db.query(query, [bookingId, status]);
        return result.rows[0];
    }

    /**
     * Mengambil riwayat booking pengguna (pagination).
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
     * Mengambil detail satu booking pengguna.
     */
    async getBookingById(bookingId, userId) {
        const query = `
            SELECT b.id, b.booking_time, b.status, b.total_amount, 
            p.name as package_name, br.name as branch_name
            FROM phourto.bookings b
            JOIN phourto.packages p ON b.package_id = p.id
            JOIN phourto.branches br ON b.branch_id = br.id
            WHERE b.id = $1 AND b.user_id = $2
        `;
        const result = await db.query(query, [bookingId, userId]);

        if (result.rows.length === 0) {
            throw new apiError('Booking tidak ditemukan.', 404);
        }
        return result.rows[0];
    }
}

module.exports = new BookingService();