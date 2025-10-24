const request = require('supertest');
const app = require('../server'); // 1. Impor aplikasi Express
const jwt = require('jsonwebtoken'); // 2. Impor JWT untuk membuat token palsu
const apiError = require('../src/utils/apiError');

// 3. Impor service yang akan kita mock
const PhotoService = require('../src/api/services/photo.service');

// === MOCK SEMUA DEPENDENSI ===
// 1. Mock PhotoService (agar controller tidak memanggil logika service asli)
// Kita gunakan mock manual untuk konsistensi
jest.mock('../src/api/services/photo.service', () => ({
    getPhotosByUserId: jest.fn(),
    getPhotoById: jest.fn(),
    deletePhoto: jest.fn(),
}));

// 2. Mock Database (PENTING: untuk mencegah timeout)
jest.mock('../src/config/database', () => ({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: jest.fn(() => ({
        query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
        release: jest.fn(),
    })),
    end: jest.fn(),
}));

// 3. Mock logger (PENTING: untuk mencegah error 'stream.write')
jest.mock('../src/utils/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
    morganMiddleware: jest.fn(),
}));
// === AKHIR MOCK ===


// Siapkan data pengguna palsu dan token palsu untuk tes
const testUserPayload = { id: 1, name: 'User Foto', role: 'customer' };
const testToken = jwt.sign(testUserPayload, process.env.JWT_SECRET, { expiresIn: '1h' });


// Blok tes utama untuk Rute Foto
describe('Photo Routes (/api/photos)', () => {

    // Bersihkan semua mock setelah setiap tes
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ===================================
    // Tes untuk: GET /api/photos
    // (Menguji 'getMyPhotos' di controller Anda)
    // ===================================
    describe('GET /', () => {

        it('harus mengembalikan foto milik pengguna jika token valid', async () => {
            // ARRANGE (Persiapan)
            // Buat data foto palsu
            const mockPhotos = [
                { id: 1, booking_id: 10, photo_url: 'http://example.com/foto1.jpg', is_watermarked: false },
                { id: 2, booking_id: 10, photo_url: 'http://example.com/foto2.jpg', is_watermarked: true }
            ];
            // Atur agar service palsu mengembalikan data ini
            PhotoService.getPhotosByUserId.mockResolvedValue(mockPhotos);

            // ACT (Eksekusi)
            // Kirim request ke endpoint DENGAN token
            const res = await request(app)
                .get('/api/photos')
                .set('Authorization', `Bearer ${testToken}`); // <-- Set token di sini

            // ASSERT (Pengecekan)
            expect(res.statusCode).toEqual(200);
            // Cek 'res.body.data' karena Anda menggunakan apiResponse
            expect(res.body.data).toEqual(mockPhotos); 
            expect(res.body.message).toBe('Foto berhasil diambil.');
            // Pastikan service dipanggil dengan ID user dari token
            expect(PhotoService.getPhotosByUserId).toHaveBeenCalledWith(testUserPayload.id);
        });

        it('harus mengembalikan 401 jika tidak ada token', async () => {
            // ACT
            // Kirim request TANPA token
            const res = await request(app)
                .get('/api/photos');
            
            // ASSERT
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toContain('Token tidak ditemukan');
        });
    });

});
