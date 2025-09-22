const db = require('../../config/database');
const apiError = require('../../utils/apiError');
const logger = require('../../utils/logger');

// Enum status booking
const BOOKING_STATUS = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
};

// Expired payment diambil dari ENV atau default 15 menit
const PAYMENT_EXPIRY_MINUTES = process.env.PAYMENT_EXPIRY_MINUTES
    ? parseInt(process.env.PAYMENT_EXPIRY_MINUTES, 10)
    : 15;

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
     * Membuat booking baru.
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

            // 3. Insert booking baru
            const newBookingResult = await client.query(
                `INSERT INTO phourto.bookings 
                (user_id, branch_id, package_id, booking_time, total_amount, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, user_id, branch_id, package_id, booking_time, total_amount, status`,
                [userId, branch_id, package_id, booking_time, totalAmount, BOOKING_STATUS.PENDING_PAYMENT]
            );
            const newBooking = newBookingResult.rows[0];

            await client.query('COMMIT');

            // --- Placeholder Payment Gateway ---
            const paymentInfo = {
                is_mock: true,
                qr_code_url: `https://api.paymentgateway.com/qris/${newBooking.id}`,
                expires_at: new Date(Date.now() + PAYMENT_EXPIRY_MINUTES * 60 * 1000)
            };
            // ----------------------------------

            return { booking: newBooking, paymentInfo };
        } catch (err) {
            await client.query('ROLLBACK');
            logger.error('CreateBooking failed:', err);
            throw err;
        } finally {
            client.release();
        }
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
