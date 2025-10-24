const request = require('supertest');
const app = require('../server'); 
const AuthService = require('../src/api/services/auth.service');
const apiError = require('../src/utils/apiError');

// Mock AuthService
jest.mock('../src/api/services/auth.service');

jest.mock('../src/config/database', () => ({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
}));

jest.mock('../src/utils/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
    morganMiddleware: jest.fn(), // Kita mock morganMiddleware juga
}));

describe('Auth Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ===================================
    // Tes untuk: POST /api/auth/register
    // ===================================
    describe('POST /api/auth/register', () => {
        
        it('harus membuat user baru (register) dengan data valid', async () => {
            const inputData = {
                full_name: 'User Tes',
                email: 'test@example.com',
                password: 'password123',
                confirm_password: 'password123',
                whatsapp_number: '08123456789'
            };
            
            const serviceResponse = { id: 1, email: inputData.email };
            AuthService.registerUser.mockResolvedValue(serviceResponse);

            const res = await request(app)
                .post('/api/auth/register')
                .send(inputData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toBe('Registrasi berhasil. Silakan login.');
            expect(res.body.data).toEqual(serviceResponse); // Data dibungkus di 'data'
            
            expect(AuthService.registerUser).toHaveBeenCalled();
        });

        it('harus mengembalikan error 400 jika validasi gagal (email tidak valid)', async () => {
            const inputData = {
                full_name: 'User Tes',
                email: 'bukan-email', // <-- Data tidak valid
                password: 'password123',
                confirm_password: 'password123',
                whatsapp_number: '08123456789'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(inputData);

            // Setelah server.js diperbaiki, ini akan mengembalikan 400
            expect(res.statusCode).toEqual(400); 
            expect(res.body).toHaveProperty('errors');
            expect(AuthService.registerUser).not.toHaveBeenCalled();
        });

        it('harus mengembalikan error 400 jika password tidak cocok', async () => {
            const inputData = {
                full_name: 'User Tes',
                email: 'test@example.com',
                password: 'password123',
                confirm_password: 'passwordSALAH', // <-- Data tidak valid
                whatsapp_number: '08123456789'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(inputData);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(AuthService.registerUser).not.toHaveBeenCalled();
        });
    });

    // ===================================
    // Tes untuk: POST /api/auth/login
    // ===================================
    describe('POST /api/auth/login', () => {

        it('harus login dan mengembalikan token jika kredensial benar', async () => {
            const inputData = {
                email: 'test@example.com',
                password: 'password123'
            };
            
            const serviceResponse = { token: 'ini.adalah.token.palsu' };
            AuthService.loginUser.mockResolvedValue(serviceResponse);

            const res = await request(app)
                .post('/api/auth/login')
                .send(inputData);

            // --- PERBAIKAN: Cek 'data.token' karena Anda pakai apiResponse ---
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Login berhasil.');
            expect(res.body.data).toHaveProperty('token', serviceResponse.token); 
            expect(AuthService.loginUser).toHaveBeenCalledWith(inputData);
        });

        it('harus mengembalikan error 401 jika service melempar error (password salah)', async () => {
            const inputData = {
                email: 'test@example.com',
                password: 'passwordSALAH'
            };

            const errorPesan = 'Email atau password salah.';
            AuthService.loginUser.mockRejectedValue(new apiError(errorPesan, 401));

            const res = await request(app)
                .post('/api/auth/login')
                .send(inputData);

            // Setelah server.js diperbaiki, ini akan mengembalikan 401
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe(errorPesan);
        });
    });

});