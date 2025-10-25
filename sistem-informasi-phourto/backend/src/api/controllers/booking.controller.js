const BookingService = require('../services/booking.service');
const paymentService = require('../services/payment.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiError = require('../../utils/apiError');
const { validationResult } = require('express-validator');
const apiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

class BookingController {
    /**
     * Mengecek ketersediaan slot.
     * Endpoint: GET /api/bookings/availability?branchId=1&date=2023-09-01
     */ 
    checkAvailability = asyncHandler(async (req, res) => {
        // TERIMA SEBAGAI camelCase
        const { branchId, date } = req.query;

        if (!branchId || !date) {
            throw new apiError('branchId dan date adalah parameter yang wajib.', 400);
        }

        const branchIdInt = parseInt(branchId, 10);
        if (isNaN(branchIdInt)) {
            throw new apiError('branchId harus berupa angka.', 400);
        }

        // KIRIM SEBAGAI camelCase
        const availableSlots = await BookingService.checkAvailability(branchIdInt, date);

        new apiResponse(res, 200, availableSlots, 'Ketersediaan slot berhasil diambil.');
    });
    
    // Membuat booking baru
    create = asyncHandler(async (req, res) => {
        // 1. Validasi input request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Kita lempar error kustom agar ditangkap asyncHandler
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        const userId = req.user?.id;
        if (!userId) {
            throw new apiError (401, 'User tidak ditemukan. Silakan login kembali.');
        }

        // 2. Validasi tipe pembayaran (TERIMA SEBAGAI camelCase)
        const paymentType = req.body.paymentType;
        const allowedPaymentTypes = ['qris', 'bank_transfer', 'credit_card', 'gopay', 'shopeepay', 'dana'];
        if (!allowedPaymentTypes.includes(paymentType)) {
            throw new apiError (400, `Jenis pembayaran tidak valid. Gunakan salah satu dari: ${allowedPaymentTypes.join(', ')}`);
        }

        // 3. Siapkan opsi tambahan (jika ada)
        const options = req.body.options || {};

        // 4. Buat booking + pembayaran
        let booking;
        let paymentResponse;
        try {
            // a. Buat booking di DB (KIRIM SEBAGAI camelCase)
            booking = await BookingService.createBooking(userId, {
                ...req.body, // req.body sekarang { packageId, branchId, bookingTime, paymentType, ... }
                status: 'pending_payment',
            });

            // b. Panggil Midtrans
            paymentResponse = await paymentService.createTransaction(booking, req.user, paymentType, options);

            // c. Simpan informasi pembayaran (KIRIM SEBAGAI camelCase)
            await BookingService.savePaymentInfo(booking.id, {
                transactionId: paymentResponse.transaction_id, // <-- (Midtrans mungkin mengembalikan snake_case, itu OK)
                orderId: paymentResponse.order_id,
                grossAmount: paymentResponse.gross_amount,
                paymentType: paymentType,
                paymentUrl: paymentResponse.payment_url || null,
                qrCodeUrl: paymentResponse.qr_code_url || null,
                expiresAt: paymentResponse.expires_at,
                status: 'waiting_payment'
            });

            // d. Update booking status
            await BookingService.updateBookingStatus(booking.id, 'waiting_payment');

        } catch (error) {
            // Rollback
            if (booking?.id) {
                await BookingService.updateBookingStatus(booking.id, 'failed_payment');
            }
            logger.error('Gagal membuat booking + payment:', error);
            // Lempar error untuk ditangkap asyncHandler
            throw new apiError (502, 'Gagal memproses booking atau pembayaran.');
        }

        // 5. Response final
        const result = {
            booking,
            payment: paymentResponse
        };

        new apiResponse(res, 201, result, 'Booking berhasil dibuat dan menunggu pembayaran.');
    });

    // Mendapatkan riwayat booking user
    // Endpoint: GET /api/bookings/my-bookings
    getMyBookings = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            throw new apiError ('User tidak ditemukan. Silakan login kembali.', 401);
        }

        const bookings = await BookingService.getBookingsByUserId(userId);
        new apiResponse(res, 200, bookings, 'Riwayat booking berhasil diambil.');
    });
        
    // Mendapatkan detail booking user berdasarkan ID
    // Endpoint: GET /api/bookings/1
    getBookingById = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;
        const bookingId = parseInt(id, 10);

        if (!userId) {
            throw new apiError ('User tidak ditemukan. Silakan login kembali.', 401);
        }

        if (isNaN(bookingId)) {
            throw new apiError('ID booking harus berupa angka.', 400);
        }

        const booking = await BookingService.getBookingById(bookingId, userId);
        new apiResponse(res, 200, booking, 'Detail booking berhasil diambil.');
    });
}

module.exports = new BookingController();