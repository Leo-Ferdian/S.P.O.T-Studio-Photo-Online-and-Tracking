const PackageController = require('../src/api/controllers/package.controller');
const PackageService = require('../src/api/services/package.service');
const apiResponse = require('../src/utils/apiResponse');
const apiError = require('../src/utils/apiError');

// Mock dependencies terlebih dahulu
jest.mock('../src/utils/asyncHandler', () => (fn) => fn);
jest.mock('../src/api/services/package.service');
jest.mock('../src/utils/apiResponse');

describe('PackageController.getAll', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    it('harus memanggil PackageService.getAllPackages dan mengembalikan response sukses', async () => {
        // Arrange
        const mockPackages = [
            { id: 1, name: 'Paket Hemat', price: 100000 },
            { id: 2, name: 'Paket Premium', price: 250000 },
        ];
        PackageService.getAllPackages.mockResolvedValue(mockPackages);

        // Act
        await PackageController.getAll(req, res);

        // Assert
        expect(PackageService.getAllPackages).toHaveBeenCalled();
        expect(apiResponse).toHaveBeenCalledWith(
            res,
            200,
            mockPackages,
            'Data paket berhasil diambil.'
        );
    });

    it('harus melempar apiError jika data paket kosong', async () => {
        PackageService.getAllPackages.mockResolvedValue([]);

        // Act
        let caughtError;
        try {
            await PackageController.getAll(req, res);
        } catch (err) {
            caughtError = err;
        }

        // Assert
        expect(caughtError).toBeInstanceOf(apiError);
        expect(caughtError.message).toBe('Tidak ada data paket tersedia.');
        expect(caughtError.statusCode).toBe(404);
    });


    it('harus melempar apiError jika terjadi error pada service', async () => {
        // Arrange
        const serviceError = new Error('Database connection failed');
        PackageService.getAllPackages.mockRejectedValue(serviceError);

        // Act & Assert
        await expect(PackageController.getAll(req, res)).rejects.toThrow(
            'Database connection failed'
        );
    });
});