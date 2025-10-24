// const request = require('supertest');
// const app = require('../../server'); // 1. Impor aplikasi Express
// const jwt = require('jsonwebtoken'); // 2. Impor JWT untuk membuat token palsu
// const apiError = require('../../src/utils/apiError');

// // 3. Impor service yang akan kita mock
// // Kita asumsikan PhotoService menangani logika delete
// const PhotoService = require('../../src/api/services/photo.service');

// // === MOCK SEMUA DEPENDENSI ===
// // 1. Mock PhotoService (Manual)
// // Ini PENTING karena photo.service.js mengimpor s3.service.js
// jest.mock('../../src/api/services/photo.service', () => ({
//     // Tambahkan semua fungsi dari photo.service.js Anda di sini
//     addPhotosToBooking: jest.fn(),
//     getPhotosByBooking: jest.fn(),
//     getPhotosByUserId: jest.fn(),
//     // Tambahkan fungsi deletePhoto yang akan dipanggil oleh controller admin
//     deletePhotoById: jest.fn(), 
// }));

// // 2. Mock S3Service (PENTING: untuk mencegah error dependensi dari PhotoService)
// jest.mock('../../src/api/services/s3.service', () => ({
//     getSignedUrl: jest.fn(),
//     deleteFile: jest.fn(),
// }));

// // 3. Mock Database (PENTING: untuk mencegah timeout)
// jest.mock('../../src/config/database', () => ({
//     query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
//     connect: jest.fn(() => ({
//         query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
//         release: jest.fn(),
//         on: jest.fn(),
//     })),
//     end: jest.fn(),
// }));

// // 4. Mock logger (PENTING: untuk mencegah error 'stream.write')
// jest.mock('../../src/utils/logger', () => ({
//     logger: {
//         info: jest.fn(),
//         warn: jest.fn(),
//         error: jest.fn(),
//     },
//     morganMiddleware: jest.fn(),
// }));
// // === AKHIR MOCK ===


// // Siapkan token palsu untuk ADMIN dan CUSTOMER
// const adminPayload = { id: 1, name: 'Admin Tes', email: 'admin@example.com', role: 'admin' };
// const adminToken = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

// const customerPayload = { id: 2, name: 'Customer Tes', email: 'customer@example.com', role: 'customer' };
// const customerToken = jwt.sign(customerPayload, process.env.JWT_SECRET, { expiresIn: '1h' });


// // Blok tes utama untuk Rute Admin Foto
// describe('Admin Photo Routes (/api/admin/photos)', () => {

//     // Bersihkan semua mock setelah setiap tes
//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     // ===================================
//     // Tes untuk: DELETE /api/admin/photos/:id
//     // ===================================
//     describe('DELETE /:id', () => {

//         it('harus mengembalikan 200 dan pesan sukses jika admin valid', async () => {
//             // ARRANGE (Persiapan)
//             // Atur agar service palsu berhasil (tidak mengembalikan apa-apa)
//             PhotoService.deletePhotoById.mockResolvedValue();

//             // ACT (Eksekusi)
//             // Kirim request ke endpoint DENGAN token ADMIN
//             const res = await request(app)
//                 .delete('/api/admin/photos/1') // Gunakan ID foto 1
//                 .set('Authorization', `Bearer ${adminToken}`); // <-- Token Admin

//             // ASSERT (Pengecekan)
//             expect(res.statusCode).toEqual(200);
//             expect(res.body.message).toBe('Foto berhasil dihapus.');
//             // Pastikan service dipanggil dengan ID yang benar
//             expect(PhotoService.deletePhotoById).toHaveBeenCalledWith(1);
//         });

//         it('harus mengembalikan 403 Forbidden jika pengguna adalah customer', async () => {
//             // ACT
//             // Kirim request DENGAN token CUSTOMER
//             const res = await request(app)
//                 .delete('/api/admin/photos/1')
//                 .set('Authorization', `Bearer ${customerToken}`); // <-- Token Customer

//             // ASSERT
//             expect(res.statusCode).toEqual(403);
//             expect(res.body.message).toContain('Hanya admin yang diizinkan');
//             // Pastikan service TIDAK dipanggil
//             expect(PhotoService.deletePhotoById).not.toHaveBeenCalled();
//         });

//         it('harus mengembalikan 401 Unauthorized jika tidak ada token', async () => {
//             // ACT
//             // Kirim request TANPA token
//             const res = await request(app)
//                 .delete('/api/admin/photos/1');

//             // ASSERT
//             expect(res.statusCode).toEqual(401);
//             expect(res.body.message).toContain('Token tidak ditemukan');
//             // Pastikan service TIDAK dipanggil
//             expect(PhotoService.deletePhotoById).not.toHaveBeenCalled();
//         });
//     });
// });