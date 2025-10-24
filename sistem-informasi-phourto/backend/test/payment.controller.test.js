const PaymentController = require('../src/api/controllers/payment.controller');
const PaymentService = require('../src/api/services/payment.service');
const logger = require('../src/utils/logger');

// Mock dependencies
jest.mock('../src/utils/asyncHandler', () => (fn) => fn);
jest.mock('../src/api/services/payment.service');
jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
}));

describe('PaymentController.handleDokuNotification', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: { order: 'INV-001', amount: 50000 },
            headers: { 'x-doku-signature': 'abc123' },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    it('harus memanggil PaymentService.handleDokuNotification dengan payload dan headers yang benar', async () => {
        // Arrange
        PaymentService.handleDokuNotification.mockResolvedValue();

        // Act
        await PaymentController.handleDokuNotification(req, res);

        // Assert
        expect(logger.info).toHaveBeenCalledWith(
            'Menerima notifikasi webhook DOKU:',
            req.body
        );
        expect(PaymentService.handleDokuNotification).toHaveBeenCalledWith(
            req.body,
            req.headers
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
    });

    it('harus melempar error jika PaymentService.handleDokuNotification gagal', async () => {
        // Arrange
        const error = new Error('Service error');
        PaymentService.handleDokuNotification.mockRejectedValue(error);

        // Act
        await expect(PaymentController.handleDokuNotification(req, res))
            .rejects
            .toThrow('Service error');
    });
});