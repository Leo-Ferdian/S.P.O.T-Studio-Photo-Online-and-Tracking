const request = require('supertest');
const app = require('../server'); // 1. Impor aplikasi Express
const apiError = require('../src/utils/apiError');

// 2. Impor service yang akan kita mock
const BranchService = require('../src/api/services/branch.service');

// === MOCK SEMUA DEPENDENSI ===
// 1. Mock BranchService (Manual)
// Kita me-mock semua fungsi dari service, baik publik maupun admin
jest.mock('../src/api/services/branch.service', () => ({
    getAllBranches: jest.fn(),
    getBranchById: jest.fn(),
    createBranch: jest.fn(),
    updateBranch: jest.fn(),
    deleteBranch: jest.fn(),
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


// Blok tes utama untuk Rute Cabang Publik
describe('Public Branch Routes (/api/branches)', () => {

    // Bersihkan semua mock setelah setiap tes
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ===================================
    // Tes untuk: GET /api/branches
    // (Menguji 'getAll' di controller)
    // ===================================
    describe('GET /', () => {

        it('harus mengembalikan semua cabang publik', async () => {
            // ARRANGE (Persiapan)
            const mockBranches = [
                { id: 1, name: 'Cabang A', address: 'Jalan A' },
                { id: 2, name: 'Cabang B', address: 'Jalan B' }
            ];
            // Atur agar service palsu mengembalikan data ini
            BranchService.getAllBranches.mockResolvedValue(mockBranches);

            // ACT (Eksekusi)
            // Kirim request ke endpoint (tidak perlu token)
            const res = await request(app).get('/api/branches');

            // ASSERT (Pengecekan)
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual(mockBranches);
            expect(res.body.message).toBe('Data cabang berhasil diambil.');
            expect(BranchService.getAllBranches).toHaveBeenCalledTimes(1);
        });
    });

    // ===================================
    // Tes untuk: GET /api/branches/:id
    // (Menguji 'getById' di controller)
    // ===================================
    describe('GET /:id', () => {

        it('harus mengembalikan detail cabang jika ID valid', async () => {
            // ARRANGE
            const mockBranch = { id: 1, name: 'Cabang A', address: 'Jalan A' };
            BranchService.getBranchById.mockResolvedValue(mockBranch);

            // ACT
            const res = await request(app).get('/api/branches/1');

            // ASSERT
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual(mockBranch);
            expect(res.body.message).toBe('Detail cabang berhasil diambil.');
            expect(BranchService.getBranchById).toHaveBeenCalledWith(1);
        });

        it('harus mengembalikan 404 jika ID tidak ditemukan oleh service', async () => {
            // ARRANGE
            const errorMsg = 'Cabang tidak ditemukan.';
            BranchService.getBranchById.mockRejectedValue(new apiError(errorMsg, 404));

            // ACT
            const res = await request(app).get('/api/branches/999');

            // ASSERT
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toBe(errorMsg);
        });

        it('harus mengembalikan 400 jika ID tidak valid (bukan angka)', async () => {
            // ARRANGE
            // Tidak perlu mock service, karena validator akan gagal duluan
            
            // ACT
            const res = await request(app).get('/api/branches/abc');

            // ASSERT
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            
            // --- PERBAIKAN: Sesuaikan dengan pesan error yang diterima ---
            expect(res.body.message).toContain('ID cabang tidak valid.');
            
            // Pastikan service TIDAK dipanggil
            expect(BranchService.getBranchById).not.toHaveBeenCalled();
        });
    });

});