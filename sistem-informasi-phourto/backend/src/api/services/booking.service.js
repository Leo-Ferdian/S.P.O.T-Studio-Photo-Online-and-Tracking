const db = require('../../config/database');
const ApiError = require('../../utils/apiError');
const { logger } = require('../../utils/logger');
const PackageService = require('./package.service')
const { BOOKING_STATUS, BOOKING_ACTIONS } = require('../../config/constants');
const PAYMENT_DEADLINE_MINUTES = 60;

const ZIP_STATUS = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    READY: 'READY',
    FAILED: 'FAILED'
};

class BookingService {

    // =================================================================
    // FUNGSI INTI (LOGIKA KETERSEDIAAN V1.8)
    // =================================================================

    /**
     * FUNGSI KRITIS: Mengecek ketersediaan slot waktu.
     * (Refactored V1.8 - Menggunakan SQL Overlap standar)
     */
    async _checkSlotAvailability(roomId, startTime, endTime, excludeBookingId = null, client = db) {

        const availabilityQuery = `
            SELECT 
                (EXISTS (
                    SELECT 1
                    FROM bookings
                    WHERE room_id = $1
                    AND payment_status IN ('PENDING', 'PAID-DP', 'PAID-FULL')
                    AND (start_time < $3 AND end_time > $2)
                    AND ($4::UUID IS NULL OR booking_id != $4::UUID)
                ))
                OR
                (EXISTS (
                    SELECT 1
                    FROM room_blocks
                    WHERE room_id = $1
                    AND (start_time < $3 AND end_time > $2)
                )) AS is_conflicting;
        `;

        try {
            const result = await client.query(availabilityQuery, [roomId, startTime, endTime, excludeBookingId]);
            const isConflicting = result.rows[0].is_conflicting;
            return !isConflicting; // true jika TIDAK bentrok
        } catch (error) {
            // PERBAIKAN: logger.error() sekarang akan berfungsi
            logger.error('Error in _checkSlotAvailability:', error);
            throw new ApiError('Gagal memeriksa ketersediaan slot.', 500);
        }
    }


    // =================================================================
    // FUNGSI UNTUK PELANGGAN (CUSTOMER-FACING)
    // =================================================================

    /**
     * @function getAvailableSlots
     * @desc Menghitung dan mengembalikan semua slot waktu yang tersedia
     * @param {string} packageId - UUID Paket
     * @param {string} dateString - Tanggal (YYYY-MM-DD)
     */
    async getAvailableSlots(packageId, dateString) {
        const client = await db.getClient();
        try {
            logger.info(`Mengecek ketersediaan untuk packageId: ${packageId} pada tanggal: ${dateString}`);

            // 1. Ambil detail Paket, Ruangan, dan Cabang (Jam Buka)
            //    Kita butuh 'duration_in_minutes' dari paket dan 'open_hours' dari cabang
            const packageQuery = `
                SELECT 
                    p.duration_in_minutes,
                    r.room_id,
                    b.open_hours 
                FROM packages p
                JOIN rooms r ON p.room_id = r.room_id
                JOIN branches b ON r.branch_id = b.branch_id
                WHERE p.package_id = $1;
            `;
            const packageResult = await client.query(packageQuery, [packageId]);
            if (packageResult.rows.length === 0) {
                throw new ApiError(404, 'Paket tidak ditemukan.');
            }

            const { duration_in_minutes, room_id, open_hours } = packageResult.rows[0];
            const duration = duration_in_minutes; // cth: 30

            // 2. Ambil SEMUA booking & blok yang ada untuk ruangan ini pada tanggal ini
            //    Kita ambil satu kali saja untuk efisiensi
            const conflictsQuery = `
                (
                    SELECT start_time, end_time
                    FROM bookings
                    WHERE room_id = $1
                    AND payment_status IN ('PENDING', 'PAID-DP', 'PAID-FULL')
                    AND CAST(start_time AS DATE) = $2
                )
                UNION
                (
                    SELECT start_time, end_time
                    FROM room_blocks
                    WHERE room_id = $1
                    AND CAST(start_time AS DATE) = $2
                );
            `;
            const conflictsResult = await client.query(conflictsQuery, [room_id, dateString]);
            const existingBookings = conflictsResult.rows; // cth: [{ start_time: '...', end_time: '...' }]

            // 3. Generate semua slot yang mungkin berdasarkan jam buka
            // cth: open_hours = "09:00-22:00"
            const [openStr, closeStr] = open_hours.split('-'); // ["09:00", "22:00"]
            const [openHour, openMin] = openStr.split(':').map(Number);
            const [closeHour, closeMin] = closeStr.split(':').map(Number);

            const targetDate = new Date(dateString); // cth: 2025-11-05T00:00:00
            const openingTime = new Date(targetDate.setHours(openHour, openMin, 0, 0));
            const closingTime = new Date(targetDate.setHours(closeHour, closeMin, 0, 0));

            const allPossibleSlots = [];
            let currentSlotTime = new Date(openingTime);

            while (true) {
                const slotEndTime = new Date(currentSlotTime.getTime() + duration * 60000);

                // Jika akhir slot sudah melewati jam tutup, hentikan loop
                if (slotEndTime > closingTime) {
                    break;
                }

                allPossibleSlots.push(new Date(currentSlotTime));

                // Maju ke slot berikutnya (berdasarkan durasi)
                currentSlotTime.setMinutes(currentSlotTime.getMinutes() + duration);
            }

            // 4. Filter slot yang bentrok
            const availableSlots = allPossibleSlots.filter(slotStartTime => {
                const slotEndTime = new Date(slotStartTime.getTime() + duration * 60000);

                // Cek apakah slot ini bentrok dengan booking yang ada
                const isConflicting = existingBookings.some(booking => {
                    // Konversi DB timestamp ke objek Date
                    const bookingStartTime = new Date(booking.start_time);
                    const bookingEndTime = new Date(booking.end_time);

                    // Logika Overlap: (MulaiA < SelesaiB) dan (SelesaiA > MulaiB)
                    return (slotStartTime < bookingEndTime && slotEndTime > bookingStartTime);
                });

                return !isConflicting; // Kembalikan true jika TIDAK bentrok
            });

            // 5. Format hasil menjadi string "HH:MM"
            const formattedSlots = availableSlots.map(date => {
                return date.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                }).replace('.', ':'); // Mengubah "09.00" -> "09:00"
            });

            return formattedSlots;

        } catch (error) {
            logger.error('Error in getAvailableSlots:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError('Gagal menghitung slot ketersediaan.', 500);
        } finally {
            client.release();
        }
    }

    /**
     * (FIXED V1.11) Membuat booking baru (status awal: PENDING).
     */
    async createBooking(userId, bookingData) {
        const { package_id, start_time, addons = [] } = bookingData;
        // Menggunakan db.connect() lebih aman untuk transaksi dibandingkan db.getClient()
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            // --- LANGKAH A: Ambil Data Paket ---
            const packageQuery = `
                SELECT p.*, r.room_id
                FROM packages p
                JOIN rooms r ON p.room_id = r.room_id
                WHERE p.package_id = $1;
                `;
            const packageResult = await client.query(packageQuery, [package_id]);
            if (packageResult.rows.length === 0) {
                throw new ApiError(404, 'Paket tidak ditemukan.');
            }
            const pkg = packageResult.rows[0];

            // --- LANGKAH B: Hitung Waktu & Cek Ketersediaan ---
            const startTimeObj = new Date(start_time);
            const endTimeObj = new Date(startTimeObj.getTime() + pkg.duration_in_minutes * 60000);

            const isAvailable = await this._checkSlotAvailability(pkg.room_id, startTimeObj, endTimeObj, null, client);
            if (!isAvailable) {
                throw new ApiError(409, 'Slot waktu sudah terisi atau bentrok. Silakan pilih waktu lain.');
            }

            // --- LANGKAH C: Hitung Harga ---
            let calculatedTotalPrice = parseFloat(pkg.price);
            let addonPriceMap = new Map();
            if (addons.length > 0) {
                const addonIds = addons.map(a => a.addon_id);
                const addonPricesResult = await client.query(
                    `SELECT addon_id, addon_price FROM addons WHERE addon_id = ANY($1::uuid[])`,
                    [addonIds]
                );
                addonPriceMap = new Map(addonPricesResult.rows.map(a => [a.addon_id.toString(), parseFloat(a.addon_price)]));
                for (const item of addons) {
                    const price = addonPriceMap.get(item.addon_id);
                    if (!price) throw new ApiError(400, `Addon ID ${item.addon_id} tidak valid.`);
                    calculatedTotalPrice += price * item.quantity;
                }
            }
            const calculatedDpAmount = calculatedTotalPrice * 0.5;

            // --- LANGKAH D: Hitung Batas Waktu Pembayaran ---
            const paymentDeadline = new Date(Date.now() + PAYMENT_DEADLINE_MINUTES * 60 * 1000);

            // --- LANGKAH E: INSERT ke 'bookings' (FIXED QUERY V1.11) ---
            const bookingQuery = `
                INSERT INTO bookings (
                    user_id, package_id, room_id, start_time, end_time,
                    total_price, dp_amount, amount_paid, payment_status,
                    payment_deadline, unique_code, zip_status 
                    )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *;`;
            const uniqueCode = `PHR-${Date.now().toString().slice(-6)}`;

            // 12 ARGUMEN DISIAPKAN UNTUK 12 PLACEHOLDER ($1 hingga $12)
            const bookingResult = await client.query(bookingQuery, [
                userId, pkg.package_id, pkg.room_id, startTimeObj, endTimeObj, // $1-$5
                calculatedTotalPrice, calculatedDpAmount, // $6-$7
                0, // $8: amount_paid (default 0)
                BOOKING_STATUS.PENDING, // $9: payment_status
                paymentDeadline, // $10: payment_deadline
                uniqueCode, // $11: unique_code
                ZIP_STATUS.PENDING // $12: zip_status
            ]);
            const newBooking = bookingResult.rows[0];

            // --- LANGKAH F: INSERT ke 'booking_addons' --- (No change)
            if (addons.length > 0) {
                const addonInsertQuery = `
                    INSERT INTO booking_addons (booking_id, addon_id, quantity, price_at_booking)
                    VALUES ($1, $2, $3, $4);
                    `;
                for (const item of addons) {
                    const price = addonPriceMap.get(item.addon_id);
                    await client.query(addonInsertQuery, [newBooking.booking_id, item.addon_id, item.quantity, price]);
                }
            }

            // --- LANGKAH G: INSERT ke 'booking_history' --- (No change)
            await client.query(
                `INSERT INTO booking_history (booking_id, user_id_actor, action_type, details_after)
                VALUES ($1, $2, $3, $4)`,
                [newBooking.booking_id, userId, BOOKING_ACTIONS.CREATED, JSON.stringify(newBooking)]
            );

            await client.query('COMMIT');
            return newBooking;

        } catch (err) {
            await client.query('ROLLBACK');
            logger.error('Error in createBooking transaction:', err);

            // Tambahkan penanganan error database spesifik di sini (jika ada)
            if (err.code === '23503') { // Foreign Key violation
                throw new ApiError('Data paket, ruangan, atau pengguna tidak valid.', 400);
            }

            if (err instanceof ApiError) throw err;
            throw new ApiError('Gagal membuat pesanan.', 500); // <-- Catch-all error
        } finally {
            client.release();
        }
    }
    // ... (Fungsi 'getMyBookings' tidak berubah) ...

    /**
     * (Refactored V1.8) Mengambil riwayat booking milik pengguna.
     */
    async getMyBookings(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT 
                b.booking_id, b.start_time, b.payment_status, b.total_price, 
                p.package_name, br.branch_name
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            JOIN rooms r ON p.room_id = r.room_id
            JOIN branches br ON r.branch_id = br.branch_id
            WHERE b.user_id = $1 
            ORDER BY b.start_time DESC 
            LIMIT $2 OFFSET $3
        `;
        const result = await db.query(query, [userId, limit, offset]);

        const countQuery = `SELECT COUNT(*) FROM bookings WHERE user_id = $1`;
        const countResult = await db.query(countQuery, [userId]);
        const total = parseInt(countResult.rows[0].count, 10);

        return {
            data: result.rows,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }


    // ... (Fungsi 'getBookingById' tidak berubah) ...

    /**
     * (Refactored V1.8) Mengambil detail satu booking milik pengguna.
     */
    async getBookingById(bookingId, userId) {
        // Query 1: Ambil data booking utama
        const query = `
            SELECT 
                b.*, 
                p.package_name, 
                br.branch_name, 
                r.room_name_display
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            JOIN rooms r ON p.room_id = r.room_id
            JOIN branches br ON r.branch_id = br.branch_id
            WHERE b.booking_id = $1 AND b.user_id = $2
        `;
        const result = await db.query(query, [bookingId, userId]);
        if (result.rows.length === 0) {
            throw new ApiError(404, 'Booking tidak ditemukan atau Anda tidak memiliki akses.');
        }
        const bookingData = result.rows[0];

        // Query 2: Ambil addons yang dipesan
        const addonsQuery = `
            SELECT ba.quantity, ba.price_at_booking, a.addon_name, a.addon_unit
            FROM booking_addons ba
            JOIN addons a ON ba.addon_id = a.addon_id
            WHERE ba.booking_id = $1;
        `;
        const addonsResult = await db.query(addonsQuery, [bookingId]);
        bookingData.addons = addonsResult.rows;

        // Query 3: Ambil riwayat/history pesanan
        const historyQuery = `
            SELECT h.*, u.full_name as actor_name
            FROM booking_history h
            LEFT JOIN users u ON h.user_id_actor = u.user_id
            WHERE h.booking_id = $1
            ORDER BY h.created_at ASC
        `;
        const historyResult = await db.query(historyQuery, [bookingId]);
        bookingData.history = historyResult.rows;

        return bookingData;
    }

    // =================================================================
    // FUNGSI UNTUK ADMIN
    // =================================================================

    /**
     * Mengambil semua data booking dari semua pengguna.
     */
    async getAllBookings(page = 1, limit = 10, filters = {}) {
        const offset = (page - 1) * limit;
        let dataQuery = `
            SELECT 
                b.booking_id, b.start_time, b.payment_status, b.total_price, 
                u.full_name as customer_name,
                p.package_name, br.branch_name
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN packages p ON b.package_id = p.package_id
            JOIN rooms r ON p.room_id = r.room_id
            JOIN branches br ON r.branch_id = br.branch_id
        `;

        let countQuery = `SELECT COUNT(*) FROM bookings b`;
        const queryParams = [];
        const countParams = [];
        let whereClauses = [];

        // --- PENYESUAIAN 1: Tambahkan 'JOIN' di luar 'if' untuk countQuery ---
        let countJoin = '';

        if (filters.status) {
            queryParams.push(filters.status);
            countParams.push(filters.status);
            whereClauses.push(`b.payment_status = $${queryParams.length}`);
        }
        if (filters.branch_id) {
            queryParams.push(filters.branch_id);
            countParams.push(filters.branch_id);
            // Simpan join untuk countQuery
            countJoin = ` JOIN packages p ON b.package_id = p.package_id JOIN rooms r ON p.room_id = r.room_id`;
            whereClauses.push(`r.branch_id = $${queryParams.length}`);
        }

        if (filters.date) {
            queryParams.push(filters.date); // format 'YYYY-MM-DD'
            countParams.push(filters.date);
            // CAST timestamp 'start_time' menjadi 'date' untuk perbandingan
            whereClauses.push(`CAST(b.start_time AS DATE) = $${queryParams.length}`);
        }

        // Gabungkan JOIN dan WHERE untuk countQuery
        countQuery += countJoin;
        if (whereClauses.length > 0) {
            dataQuery += ` WHERE ${whereClauses.join(' AND ')}`;
            countQuery += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        dataQuery += ` ORDER BY b.start_time DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        const result = await db.query(dataQuery, queryParams);
        const countResult = await db.query(countQuery, countParams);

        const total = parseInt(countResult.rows[0].count, 10);

        return {
            data: result.rows,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    // ... (Fungsi 'getBookingDetailsByAdmin' tidak berubah) ...

    /**
     * (FUNGSI BARU V1.8 - Memperbaiki TypeError)
     * Mengambil detail satu booking (Admin).
     */
    async getBookingDetailsByAdmin(bookingId) {
        const query = `
            SELECT 
                b.*, 
                p.package_name, 
                br.branch_name, 
                r.room_name_display,
                u.full_name as customer_name,
                u.email as customer_email,
                u.phone_number as customer_phone
            FROM bookings b
            JOIN packages p ON b.package_id = p.package_id
            JOIN rooms r ON p.room_id = r.room_id
            JOIN branches br ON r.branch_id = br.branch_id
            JOIN users u ON b.user_id = u.user_id
            WHERE b.booking_id = $1
        `;
        const result = await db.query(query, [bookingId]);
        if (result.rows.length === 0) {
            throw new ApiError(404, 'Booking tidak ditemukan.');
        }
        const bookingData = result.rows[0];

        // Ambil addons (sama seperti getBookingById)
        const addonsQuery = `
            SELECT ba.quantity, ba.price_at_booking, a.addon_name, a.addon_unit
            FROM booking_addons ba
            JOIN addons a ON ba.addon_id = a.addon_id
            WHERE ba.booking_id = $1;
        `;
        const addonsResult = await db.query(addonsQuery, [bookingId]);
        bookingData.addons = addonsResult.rows;

        // Ambil history (sama seperti getBookingById)
        const historyQuery = `
            SELECT h.*, u.full_name as actor_name
            FROM booking_history h
            LEFT JOIN users u ON h.user_id_actor = u.user_id
            WHERE h.booking_id = $1
            ORDER BY h.created_at ASC
        `;
        const historyResult = await db.query(historyQuery, [bookingId]);
        bookingData.history = historyResult.rows;

        return bookingData;
    }

    // --- FUNGSI UNTUK DASHBOARD ---
    /**
     * @function getRecentBookingsForAdmin
     * @desc Mengambil (limit) booking terbaru untuk tabel dashboard admin.
     * @param {number} limit Jumlah booking yang akan diambil.
     */
    async getRecentBookingsForAdmin(limit = 5) {
        const query = `
            SELECT 
                b.booking_id, 
                u.full_name AS "userName",
                br.branch_name AS "locationName",
                b.start_time AS "date",
                p.package_name AS "packageName",
                b.payment_status AS "status"
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN packages p ON b.package_id = p.package_id
            JOIN rooms r ON p.room_id = r.room_id
            JOIN branches br ON r.branch_id = br.branch_id
            ORDER BY b.start_time DESC
            LIMIT $1;
        `;

        try {
            const result = await db.query(query, [limit]);
            // Mengembalikan data yang cocok dengan key di frontend
            // (userName, locationName, date, packageName, status)
            return result.rows;
        } catch (error) {
            logger.error('Error in getRecentBookingsForAdmin:', error);
            throw new ApiError('Gagal mengambil data booking terbaru.', 500);
        }
    }

    /**
 * @function updateBookingStatusByAdmin
 * @description [PERBAIKAN V1.9.9] Memperbarui status sebuah booking. Mengelola akuisisi/pelepasan client untuk transaksi.
 */
    async updateBookingStatusByAdmin(bookingId, status, adminUserId, externalClient = null) {

        // 1. Tentukan apakah klien disediakan dari luar (e.g., dari PhotoService)
        const isExternalTransaction = (externalClient !== null);

        // 2. Akuisisi klien: Gunakan klien eksternal atau ambil klien baru dari pool.
        // PERBAIKAN KRITIS V1.9.9: Klien harus diakuisisi jika ini adalah transaksi mandiri.
        const dbClient = isExternalTransaction ? externalClient : await db.getClient();

        try {
            // 3. Mulai transaksi hanya jika klien diakuisisi di fungsi ini
            if (!isExternalTransaction) {
                await dbClient.query('BEGIN');
            }

            // 1. Ambil data lama untuk history (Lock row)
            const oldDataResult = await dbClient.query('SELECT payment_status FROM bookings WHERE booking_id = $1 FOR UPDATE', [bookingId]);
            if (oldDataResult.rows.length === 0) {
                throw new ApiError(404, `Booking dengan ID ${bookingId} tidak ditemukan.`);
            }
            const oldStatus = oldDataResult.rows[0].payment_status;

            // 2. Update status
            const query = `
                UPDATE bookings 
                SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE booking_id = $2 
                RETURNING *
            `;
            const result = await dbClient.query(query, [status, bookingId]);

            // 3. Catat ke history (Jejak Audit V1.8)
            await dbClient.query(
                `INSERT INTO booking_history (booking_id, user_id_actor, action_type, details_before, details_after)
                VALUES ($1, $2, $3, $4, $5)`,
                [bookingId, adminUserId,
                    BOOKING_ACTIONS.STATUS_CHANGED,
                    JSON.stringify({ status: oldStatus }),
                    JSON.stringify({ status: status })]
            );

            // 4. Selesaikan transaksi jika mandiri
            if (!isExternalTransaction) {
                await dbClient.query('COMMIT');
            }
            return result.rows[0];

        } catch (err) {
            // 5. Batalkan transaksi jika mandiri dan terjadi error
            if (!isExternalTransaction) {
                await dbClient.query('ROLLBACK');
            }
            logger.error('Error in updateBookingStatusByAdmin transaction:', err);
            if (err instanceof ApiError) throw err;
            throw new ApiError('Gagal memperbarui status booking.', 500);
        } finally {
            // 6. WAJIB: Rilis klien HANYA jika diakuisisi di fungsi ini
            if (!isExternalTransaction) {
                dbClient.release();
            }
        }
    }

    // ... (Fungsi 'rescheduleBooking' tidak berubah) ...

    /**
     * (FUNGSI BARU V1.8 - Untuk Fitur Reschedule)
     * Menjadwalkan ulang (reschedule) sebuah booking.
     */
    async rescheduleBooking(bookingId, { newStartTime, newRoomId, reason }, adminUserId) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Kunci dan ambil data booking saat ini
            const bookingResult = await client.query('SELECT * FROM bookings WHERE booking_id = $1 FOR UPDATE', [bookingId]);
            if (bookingResult.rows.length === 0) throw new ApiError(404, 'Booking tidak ditemukan.');
            const oldBooking = bookingResult.rows[0];

            // 2. Tentukan room_id baru (jika tidak disediakan, gunakan yang lama)
            const targetRoomId = newRoomId || oldBooking.room_id;

            // 3. Ambil durasi paket
            const packageResult = await client.query('SELECT duration_in_minutes FROM packages WHERE package_id = $1', [oldBooking.package_id]);
            const duration = packageResult.rows[0].duration_in_minutes;

            // 4. Hitung waktu selesai baru
            const startTimeObj = new Date(newStartTime);
            const endTimeObj = new Date(startTimeObj.getTime() + duration * 60000);

            // 5. Cek Ketersediaan Slot BARU
            const isAvailable = await this._checkSlotAvailability(targetRoomId, startTimeObj, endTimeObj, bookingId, client);
            if (!isAvailable) {
                throw new ApiError(409, 'Slot waktu baru sudah terisi atau bentrok.');
            }

            // 6. Update booking
            const updateResult = await client.query(
                `UPDATE bookings
                SET start_time = $1, end_time = $2, room_id = $3, updated_at = CURRENT_TIMESTAMP
                WHERE booking_id = $4
                 RETURNING *`,
                [startTimeObj, endTimeObj, targetRoomId, bookingId]
            );

            // 7. Catat ke history (Jejak Audit)
            await client.query(
                `INSERT INTO booking_history (booking_id, user_id_actor, action_type, details_before, details_after)
                VALUES ($1, $2, $3, $4, $5)`,
                [bookingId, adminUserId, BOOKING_ACTIONS.RESCHEDULED,
                    JSON.stringify({ start: oldBooking.start_time, room: oldBooking.room_id }),
                    JSON.stringify({ start: startTimeObj, room: targetRoomId, reason: reason })]
            );

            await client.query('COMMIT');
            return updateResult.rows[0];

        } catch (err) {
            await client.query('ROLLBACK');
            // PERBAIKAN: logger.error() sekarang akan berfungsi
            logger.error('Error in rescheduleBooking transaction:', err);
            if (err instanceof ApiError) throw err;
            throw new ApiError('Gagal melakukan reschedule.', 500);
        } finally {
            client.release();
        }
    }

    // =================================================================
    // FUNGSI INTERNAL (DIPANGGIL OLEH SERVICE LAIN)
    // =================================================================

    // ... (Fungsi 'handleSuccessfulPayment' tidak berubah) ...

    /**
     * (Refactored V1.8) Dipanggil oleh PaymentService saat webhook pembayaran berhasil.
     */
    async handleSuccessfulPayment(bookingId, amountPaid, paymentType, client) {
        // 'client' DIWAJIBKAN dari PaymentService

        const bookingResult = await client.query('SELECT * FROM bookings WHERE booking_id = $1 FOR UPDATE', [bookingId]);
        if (bookingResult.rows.length === 0) throw new ApiError(404, 'Booking tidak ditemukan.');

        const booking = bookingResult.rows[0];

        const totalPaid = parseFloat(amountPaid);
        const newAmountDue = parseFloat(booking.total_price) - totalPaid;

        let newStatus = booking.payment_status;

        // Tentukan status baru
        if (totalPaid >= parseFloat(booking.total_price)) {
            newStatus = BOOKING_STATUS.PAID_FULL;
        } else if (totalPaid >= parseFloat(booking.dp_amount)) {
            newStatus = BOOKING_STATUS.PAID_DP;
        } else {
            logger.warn(`Pembayaran untuk booking ${bookingId} lebih kecil dari DP.`);
            newStatus = BOOKING_STATUS.PENDING;
        }

        // Update booking
        const updateResult = await client.query(
            `UPDATE bookings 
            SET payment_status = $1, amount_paid = $2, updated_at = CURRENT_TIMESTAMP
             WHERE booking_id = $3 RETURNING *`,
            [newStatus, totalPaid, bookingId]
        );

        // Catat ke history
        await client.query(
            `INSERT INTO booking_history (booking_id, action_type, details_before, details_after)
            VALUES ($1, $2, $3, $4)`,
            [bookingId,
                BOOKING_ACTIONS.PAYMENT_RECEIVED,
                JSON.stringify({ status: booking.payment_status, paid: booking.amount_paid }),
                JSON.stringify({ status: newStatus, paid: totalPaid, payment_type: paymentType })]
        );

        return updateResult.rows[0];
    }

    // ... (Fungsi 'expireOldBookings' tidak berubah) ...

    /**
     * (Refactored V1.8) Dipanggil oleh Cron Job (Penagih Otomatis)
     * Untuk mengubah status PENDING -> EXPIRED
     */
    async expireOldBookings() {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            const query = `
                UPDATE bookings
                SET payment_status = $1
                WHERE payment_status = $2 AND payment_deadline < NOW()
                RETURNING booking_id;
            `;

            const result = await client.query(query, [BOOKING_STATUS.EXPIRED, BOOKING_STATUS.PENDING]);

            if (result.rowCount > 0) {
                logger.info(`[CronJob] Berhasil meng-expire ${result.rowCount} pesanan.`);

                // Catat ke history untuk SEMUA pesanan yang di-expire
                const historyQuery = `
                    INSERT INTO booking_history (booking_id, user_id_actor, action_type, details_before, details_after)
                    SELECT 
                        booking_id, 
                        NULL, -- Di-expire oleh Sistem (NULL)
                        $1, 
                        $2, 
                        $3
                    FROM bookings
                    WHERE booking_id = ANY($4::uuid[]);
                `;

                const expiredIds = result.rows.map(r => r.booking_id);

                await client.query(historyQuery, [
                    BOOKING_ACTIONS.STATUS_CHANGED,
                    JSON.stringify({ status: BOOKING_STATUS.PENDING }),
                    JSON.stringify({ status: BOOKING_STATUS.EXPIRED }),
                    expiredIds
                ]);
            }

            await client.query('COMMIT');
            return result.rowCount;

        } catch (error) {
            await client.query('ROLLBACK');
            // PERBAIKAN: logger.error() sekarang akan berfungsi
            logger.error('Error in expireOldBookings cron job:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    /**
 * FUNGSI BARU V1.13: Mereset status ZIP dan menghapus kunci file lama.
 * Digunakan setelah Admin upload foto baru.
 * @param {string} bookingId - UUID booking
 * @param {object} [client=db] - Klien database (opsional)
 */
    async resetZipStatus(bookingId, client = db) {
        try {
            await client.query(
                `UPDATE bookings
                SET zip_status = $1, zip_file_key = NULL, zip_created_at = NULL, updated_at = CURRENT_TIMESTAMP
                WHERE booking_id = $2`,
                [ZIP_STATUS.PENDING, bookingId]
            );
            logger.info(`ZIP status untuk booking ${bookingId} berhasil direset ke PENDING.`);
        } catch (error) {
            logger.error(`Gagal mereset ZIP status untuk booking ${bookingId}:`, error);
            throw new ApiError('Gagal mereset status ZIP di database.', 500);
        }
    }
}

module.exports = new BookingService();