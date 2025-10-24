const request = require('supertest');
const app = require('../../server'); // 1. Impor aplikasi Express
const jwt = require('jsonwebtoken'); // 2. Impor JWT untuk membuat token palsu
const apiError = require('../../src/utils/apiError');

// 3. Impor service yang akan kita mock
const AdminPackageService = require('../../src/api/services/package.service');

// === MOCK SEMUA DEPENDENSI ===
// 1. Mock AdminPackageService (Manual)
// Ini PENTING untuk mendefinisikan fungsi-fungsi yang akan dipanggil
jest.mock('../../src/api/services/package.service', () => ({
    getAllPackages: jest.fn(),
    createPackage: jest.fn(),
    getPackageById: jest.fn(),
    updatePackage: jest.fn(),
    deletePackage: jest.fn(),
}));

// 2. Mock Database (PENTING: untuk mencegah timeout)
jest.mock('../../src/config/database', () => ({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    connect: jest.fn(() => ({
        query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
        release: jest.fn(),
        on: jest.fn(),
        COMMIT: jest.fn(),
        ROLLBACK: jest.fn(),
    })),
    end: jest.fn(),
}));

// 3. Mock logger (PENTING: untuk mencegah error 'stream.write')
jest.mock('../../src/utils/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
    morganMiddleware: jest.fn(),
}));
// === AKHIR MOCK ===


// Siapkan token palsu untuk ADMIN dan CUSTOMER
const adminPayload = { id: 1, name: 'Admin Tes', email: 'admin@example.com', role: 'admin' };
const adminToken = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

const customerPayload = { id: 2, name: 'Customer Tes', email: 'customer@example.com', role: 'customer' };
const customerToken = jwt.sign(customerPayload, process.env.JWT_SECRET, { expiresIn: '1h' });


// Blok tes utama untuk Rute Admin Paket
describe('Admin Package Routes (/api/admin/packages)', () => {

    // Bersihkan semua mock setelah setiap tes
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ===================================
    // Tes untuk: GET /api/admin/packages/
    // ===================================
    describe('GET /', () => {

        it('harus mengembalikan 200 dan daftar paket jika admin valid', async () => {
            // ARRANGE
            const mockPackages = [
                { id: 1, package_name: 'Paket Basic', price: 100000 },
                { id: 2, package_name: 'Paket Premium', price: 200000 },
            ];
            AdminPackageService.getAllPackages.mockResolvedValue(mockPackages);

            // ACT
            const res = await request(app)
                .get('/api/admin/packages')
                .set('Authorization', `Bearer ${adminToken}`); // <-- Token Admin

            // ASSERT
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toEqual(mockPackages);
            expect(res.body.message).toBe('Semua paket berhasil diambil.');
            expect(AdminPackageService.getAllPackages).toHaveBeenCalledTimes(1);
        });

        it('harus mengembalikan 403 Forbidden jika pengguna adalah customer', async () => {
            // ACT
            const res = await request(app)
                .get('/api/admin/packages')
                .set('Authorization', `Bearer ${customerToken}`); // <-- Token Customer

            // ASSERT
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toContain('Hanya admin yang diizinkan');
            expect(AdminPackageService.getAllPackages).not.toHaveBeenCalled();
        });
    });

    // ===================================
    // Tes untuk: POST /api/admin/packages/
    // ===================================
    describe('POST /', () => {
        
        it('harus mengembalikan 201 dan membuat paket baru jika admin valid', async () => {
            // ARRANGE
            const inputData = {
                package_name: 'Paket Gold',
                price: 300000,
                duration_minutes: 60
            };
            const mockResponse = { id: 3, ...inputData };
            AdminPackageService.createPackage.mockResolvedValue(mockResponse);

            // ACT
            const res = await request(app)
                .post('/api/admin/packages')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(inputData);

            // ASSERT
            expect(res.statusCode).toEqual(201);
            expect(res.body.data).toEqual(mockResponse);
            expect(res.body.message).toBe('Paket baru berhasil dibuat.');
            expect(AdminPackageService.createPackage).toHaveBeenCalledWith(inputData);
        });

        it('harus mengembalikan 400 jika validasi gagal (data tidak lengkap)', async () => {
            // ARRANGE
            const invalidData = {
                price: 300000 // package_name hilang
            };

            // ACT
            const res = await request(app)
                .post('/api/admin/packages')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidData);
            
            // ASSERT
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(AdminPackageService.createPackage).not.toHaveBeenCalled();
        });

    });

});
