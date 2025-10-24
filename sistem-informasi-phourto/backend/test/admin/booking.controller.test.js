const AdminBookingController = require('../../src/api/controllers/admin/booking.controller');
const BookingService = require('../../src/api/services/booking.service');
const apiResponse = require('../../src/utils/apiResponse');
const apiError = require('../../src/utils/apiError');
const { validationResult } = require('express-validator');

// Mock dependencies
jest.mock('../../src/api/services/booking.service');
jest.mock('../../src/utils/apiResponse');
jest.mock('express-validator', () => ({
    validationResult: jest.fn(),
}));

describe('AdminBookingController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    // =========================================================
    // TEST: getAllBookings
    // =========================================================
    describe('getAllBookings', () => {
        it('harus mengembalikan daftar booking dengan sukses', async () => {
            // Arrange
            const mockResult = [{ id: 1, name: 'Test Booking' }];
            BookingService.getAllBookings.mockResolvedValue(mockResult);

            // Act
            await AdminBookingController.getAllBookings(req, res);

            // Assert
            expect(BookingService.getAllBookings).toHaveBeenCalledWith(1, 10);
            expect(apiResponse).toHaveBeenCalledWith(
                res,
                200,
                mockResult,
                'Semua data booking berhasil diambil.'
            );
        });
    });

    // =========================================================
    // TEST: updateBookingStatus
    // =========================================================
    describe('updateBookingStatus', () => {
        it('harus melempar apiError jika validasi gagal', async () => {
            // Arrange
            const mockErrors = { isEmpty: () => false, array: () => ['Invalid data'] };
            validationResult.mockReturnValue(mockErrors);

            req.params.id = '1';
            req.body.status = 'confirmed';
            const next = jest.fn();

            // Act
            await AdminBookingController.updateBookingStatus(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            const err = next.mock.calls[0][0];
            expect(err).toBeInstanceOf(apiError);
            expect(err.message).toBe(400);
            expect(err.statusCode).toBe('Validasi gagal.');
            expect(err.error).toEqual(['Invalid data']);
        });

        it('harus memperbarui status booking dengan sukses', async () => {
            // Arrange
            validationResult.mockReturnValue({ isEmpty: () => true });
            req.params.id = '1';
            req.body.status = 'confirmed';

            const mockUpdatedBooking = { id: 1, status: 'confirmed' };
            BookingService.updateBookingStatusByAdmin.mockResolvedValue(mockUpdatedBooking);
            const next = jest.fn();

            // Act
            await AdminBookingController.updateBookingStatus(req, res, next);

            // Assert
            expect(BookingService.updateBookingStatusByAdmin).toHaveBeenCalledWith('1', 'confirmed');
            expect(apiResponse).toHaveBeenCalledWith(
                res,
                200,
                mockUpdatedBooking,
                'Status booking berhasil diperbarui.'
            );
            expect(next).not.toHaveBeenCalled();
        });
    });
});