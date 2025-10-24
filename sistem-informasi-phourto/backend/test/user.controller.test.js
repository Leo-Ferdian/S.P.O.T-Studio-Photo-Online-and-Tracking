const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken'); // Untuk membuat token palsu
const apiError = require('../src/utils/apiError');

// Impor service (HANYA untuk mendapatkan referensi)
const BookingService = require('../src/api/services/booking.service');
const PaymentService = require('../src/api/services/payment.service');

// === PERBAIKAN: MOCK MANUAL UNTUK DEPENDENSI MELINGKAR ===
// Kita mock file-nya dan secara manual mendefinisikan fungsi-fungsi
// yang akan kita panggil di dalam tes. Ini memperbaiki 'TypeError'.

jest.mock('../src/api/services/booking.service', () => ({
    checkAvailability: jest.fn(),
    createBooking: jest.fn(),
    savePaymentInfo: jest.fn(), // Meskipun tidak dipanggil, aman untuk di-mock
    updateBookingStatus: jest.fn(),
    getMyBookings: jest.fn(),
    getBookingById: jest.fn(),
}));

jest.mock('../src/api/services/payment.service', () => ({
    createQrisCharge: jest.fn(),
    // Tambahkan fungsi lain dari paymentService jika Anda memanggilnya
}));
// === AKHIR MOCK MANUAL ===

// Mock dependensi lainnya (database & logger)
jest.mock('../src/config/database', () => ({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: jest.fn(() => ({
        query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
        release: jest.fn(),
        query: jest.fn(), // Mock query di dalam transaksi
    })),
    end: jest.fn(),
}));

jest.mock('../src/utils/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
    morganMiddleware: jest.fn(),
}));
// === AKHIR MOCK LAINNYA ===


// Siapkan data pengguna palsu dan token palsu untuk tes
const testUserPayload = { id: 1, name: 'User Tes', email: 'test@example.com', role: 'customer' };
const testToken = jwt.sign(testUserPayload, process.env.JWT_SECRET, { expiresIn: '1h' });


// Blok tes utama untuk Rute Booking
describe('Booking Routes (/api/bookings)', () => {

    // Bersihkan semua mock setelah setiap tes
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ===================================
    // Tes untuk: GET /api/bookings/availability
    // ===================================
    describe('GET /availability', () => {
        it('harus mengembalikan slot ketersediaan jika data valid', async () => {
            // ARRANGE
            const mockSlots = ['10:00', '11:00', '14:00'];
            BookingService.checkAvailability.mockResolvedValue(mockSlots);

            // ACT
            const res = await request(app)
                .get('/api/bookings/availability?branch_id=1&date=2025-10-25')
                .set('Authorization', `Bearer ${testToken}`); // <-- Kirim token
            
            // ASSERT
            expect(res.statusCode).toEqual(200); // Tes ini akan lolos (Controller sudah benar)
            expect(res.body.data).toEqual(mockSlots);
            expect(BookingService.checkAvailability).toHaveBeenCalledWith(1, '2025-10-25');
        });

        it('harus mengembalikan 400 jika query param "date" hilang', async () => {
            // ACT
            const res = await request(app)
                .get('/api/bookings/availability?branch_id=1') // 'date' sengaja dihilangkan
                .set('Authorization', `Bearer ${testToken}`);
            
            // ASSERT
            expect(res.statusCode).toEqual(400);
            // --- PERBAIKAN: Perbaiki typo 'branchid' menjadi 'branch_id' ---
            expect(res.body.message).toContain('branch_id dan date adalah parameter yang wajib');
        });

        it('harus mengembalikan 401 jika tidak ada token', async () => {
            // ACT
            const res = await request(app)
                .get('/api/bookings/availability?branch_id=1&date=2025-10-25'); // <-- Tanpa token
            
            // ASSERT
            expect(res.statusCode).toEqual(401);
        });
    });

    // ===================================
    // Tes untuk: POST /api/bookings
    // ===================================
    describe('POST /', () => {
        // Siapkan data input yang valid
        const inputData = {
            package_id: 1,
            branch_id: 1,
            booking_time: '2025-11-20T10:00:00.000Z',
            payment_type: 'qris'
        };

        // Siapkan respons palsu dari service
        const mockBooking = { id: 101, user_id: testUserPayload.id, ...inputData, status: 'pending_payment', total_amount: 50000 };
        const mockPaymentResponse = {
            order_id: 'SPOT-101-12345',
            qr_code_url: 'https://doku.com/qr.png',
            expires_at: '2025-11-20T10:30:00.000Z'
        };

        it('harus membuat booking baru jika data valid', async () => {
            // ARRANGE
            BookingService.createBooking.mockResolvedValue(mockBooking);
            PaymentService.createQrisCharge.mockResolvedValue(mockPaymentResponse);
            BookingService.updateBookingStatus.mockResolvedValue(true);
            
            // ACT
            const res = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${testToken}`)
                .send(inputData);
            
            // ASSERT
            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toBe('Booking berhasil dibuat dan menunggu pembayaran.');
            expect(res.body.data.booking).toEqual(mockBooking);
            expect(res.body.data.payment).toEqual(mockPaymentResponse);
            
            // Cek urutan panggilan service
            expect(BookingService.createBooking).toHaveBeenCalledTimes(1);
            expect(PaymentService.createQrisCharge).toHaveBeenCalledTimes(1);
            expect(BookingService.updateBookingStatus).toHaveBeenCalledWith(mockBooking.id, 'waiting_payment');
        });
    });

    // ===================================
    // Tes untuk: GET /api/bookings/my-bookings
    // ===================================
    describe('GET /my-bookings', () => {
        it('harus mengembalikan riwayat booking milik user', async () => {
            // ARRANGE
            const mockHistory = { data: [{ id: 101, package_name: 'Paket A' }], pagination: { total: 1 } };
            BookingService.getMyBookings.mockResolvedValue(mockHistory);
            
            // ACT
            const res = await request(app)
                .get('/api/bookings/my-bookings')
                .set('Authorization', `Bearer ${testToken}`);

            // Tes ini sekarang akan lolos (bukan 500 lagi)
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual(mockHistory);
            expect(BookingService.getMyBookings).toHaveBeenCalledWith(testUserPayload.id, 1, 10);
        });
    });

    // ===================================
    // Tes untuk: GET /api/bookings/:id
    // ===================================
    describe('GET /:id', () => {
        it('harus mengembalikan detail booking jika ID valid dan milik user', async () => {
            // ARRANGE
            const mockBookingDetail = { id: 101, user_id: testUserPayload.id, package_name: 'Paket A' };
            BookingService.getBookingById.mockResolvedValue(mockBookingDetail);
            
            // ACT
            const res = await request(app)
                .get('/api/bookings/101')
                .set('Authorization', `Bearer ${testToken}`);

            // ASSERT
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual(mockBookingDetail);
            expect(BookingService.getBookingById).toHaveBeenCalledWith(101, testUserPayload.id);
        });

        it('harus mengembalikan 404 jika booking tidak ditemukan', async () => {
            // ARRANGE
            const errorMsg = 'Booking tidak ditemukan atau Anda tidak memiliki akses.';
            BookingService.getBookingById.mockRejectedValue(new apiError(errorMsg, 404));
            
            // ACT
            const res = await request(app)
                .get('/api/bookings/999')
                .set('Authorization', `Bearer ${testToken}`);
            
            // ASSERT
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe(errorMsg);
        });
    });

});

