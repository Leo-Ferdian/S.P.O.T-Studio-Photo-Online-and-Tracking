const BookingService = require('../services/booking.service');
const paymentService = require('../services/payment.service');
const asyncHandler = require('../../utils/asyncHandler');
const apiError = require('../../utils/apiError');
const { validationResult } = require('express-validator');
const apiResponse = require('../../utils/apiResponse');
const logger = require('../../config/logger');

class BookingController {
    /**
     * Menggunakan asyncHandler untuk menangani error secara otomatis
     * 
     * Mengecek ketersediaan slot pada cabang dan tanggal tertentu
     * Endpoint: GET /api/bookings/availability?branch_id=1&date=2023-09-01
     */ 
    checkAvailability = asyncHandler(async (req, res) => {
        const { branch_id, date } = req.query;

        if (!branch_id || !date) {
            throw new apiError('branch_id dan date adalah parameter yang wajib.', 400);
        }

        // Parse input string ke integer
        const branch_Id = parseInt(branch_id, 10);
        if (isNaN(branch_Id)) {
            throw new apiError('branch_id harus berupa angka.', 400);
        }

        const availableSlots = await BookingService.checkAvailability(branch_Id, date);

        new apiResponse(res, 200, availableSlots, 'Ketersediaan slot berhasil diambil.');
    });
    
    // Membuat booking baru
    create = asyncHandler(async (req, res) => {
        // 1. Validasi input request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        const userId = req.user?.id;
        if (!userId) {
            throw new apiError (401, 'User tidak ditemukan. Silakan login kembali.');
        }

        // 2. Validasi tipe pembayaran
        const paymentType = req.body.payment_type;
        const allowedPaymentTypes = ['qris', 'bank_transfer', 'credit_card', 'gopay', 'shopeepay', 'dana']; // boleh ditambah sesuai Midtrans
        if (!allowedPaymentTypes.includes(paymentType)) {
            throw new apiError (400, `Jenis pembayaran tidak valid. Gunakan salah satu dari: ${allowedPaymentTypes.join(', ')}`);
        }

        // 3. Siapkan opsi tambahan (jika ada)
        const options = req.body.options || {};

        // 4. Buat booking + pembayaran
        let booking;
        let paymentResponse;
        try {
            // a. Buat booking di DB dengan status "pending_payment"
            booking = await BookingService.createBooking(userId, {
                ...req.body,
                status: 'pending_payment',
            });

            // b. Panggil Midtrans untuk membuat transaksi
            paymentResponse = await paymentService.createTransaction(booking, req.user, paymentType, options);

            // c. Simpan informasi pembayaran ke DB
            await BookingService.savePaymentInfo(booking.id, {
                transaction_id: paymentResponse.transaction_id,
                order_id: paymentResponse.order_id,
                gross_amount: paymentResponse.gross_amount,
                payment_type: paymentType,
                payment_url: paymentResponse.payment_url || null,
                qr_code_url: paymentResponse.qr_code_url || null,
                expires_at: paymentResponse.expires_at,
                status: 'waiting_payment'
            });

            // d. Update booking status jadi "waiting_payment"
            await BookingService.updateBookingStatus(booking.id, 'waiting_payment');

        } catch (error) {
            // Jika error terjadi, rollback booking agar data tidak nyangkut
            if (booking?.id) {
                await BookingService.updateBookingStatus(booking.id, 'failed_payment');
            }
            logger.error('Gagal membuat booking + payment:', error);
            throw new apiError (502, 'Gagal memproses booking atau pembayaran.');
        }

        // 5. Response final (booking + payment info dipisah rapi)
        const result = {
            booking,
            payment: paymentResponse
        };

        new apiResponse(res, 201, result, 'Booking berhasil dibuat dan menunggu pembayaran.');
    });
        // Mendapatkan detail booking user berdasarkan ID
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