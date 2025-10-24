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
     * Endpoint: GET /api/bookings/availability?branch_id=1&date=2023-09-01
     */ 
    checkAvailability = asyncHandler(async (req, res) => {
        const { branch_id, date } = req.query;

        if (!branch_id || !date) {
            throw new apiError('branch_id dan date adalah parameter yang wajib.', 400);
        }

        // --- PERBAIKAN: Gunakan variabel yang konsisten ---
        const branchIdInt = parseInt(branch_id, 10);
        if (isNaN(branchIdInt)) {
            throw new apiError('branch_id harus berupa angka.', 400);
        }

        const availableSlots = await BookingService.checkAvailability(branchIdInt, date);
        // --- AKHIR PERBAIKAN ---

        new apiResponse(res, 200, availableSlots, 'Ketersediaan slot berhasil diambil.');
    });
    
    // Membuat booking baru
    create = asyncHandler(async (req, res) => {
        // 1. Validasi input request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Lempar error agar ditangkap asyncHandler
            throw new apiError(400, 'Validasi gagal.', errors.array());
        }

        const userId = req.user?.id;
        if (!userId) {
            throw new apiError (401, 'User tidak ditemukan. Silakan login kembali.');
        }

        const paymentType = req.body.payment_type;
        const allowedPaymentTypes = ['qris', 'bank_transfer', 'credit_card', 'gopay', 'shopeepay', 'dana'];
        if (!allowedPaymentTypes.includes(paymentType)) {
            throw new apiError (400, `Jenis pembayaran tidak valid. Gunakan salah satu dari: ${allowedPaymentTypes.join(', ')}`);
        }

        const options = req.body.options || {};

        // 4. Buat booking + pembayaran
        let booking;
        let paymentResponse;
        try {
            // a. Buat booking
            booking = await BookingService.createBooking(userId, {
                ...req.body,
                status: 'pending_payment',
            });

            // b. Panggil Payment Service (DOKU)
            // (Kita asumsikan DOKU hanya dipanggil jika payment_type == 'qris')
            // Anda bisa sesuaikan logikanya
            if (paymentType === 'qris') {
                 paymentResponse = await paymentService.createQrisCharge(booking, req.user);
            } else {
                // TODO: Logika untuk payment type lain (jika ada)
                throw new apiError(`Payment type ${paymentType} belum didukung.`, 400);
            }

            // c. Simpan informasi pembayaran ke DB
            // (Service payment.service.js Anda sudah melakukan ini, jadi kita tidak perlu panggil BookingService.savePaymentInfo lagi)
            // Cukup gunakan respons dari createQrisCharge

            // d. Update booking status
            await BookingService.updateBookingStatus(booking.id, 'waiting_payment');

        } catch (error) {
            // Rollback
            if (booking?.id) {
                // Gunakan status 'FAILED' dari service Anda
                await BookingService.updateBookingStatus(booking.id, 'FAILED'); 
            }
            logger.error('Gagal membuat booking + payment:', error);
            // Lempar error asli atau error baru
            if (error instanceof apiError) throw error;
            throw new apiError (502, 'Gagal memproses booking atau pembayaran.');
        }

        // 5. Response final
        const result = {
            booking,
            payment: paymentResponse 
        };

        new apiResponse(res, 201, result, 'Booking berhasil dibuat dan menunggu pembayaran.');
    });

    // --- FUNGSI BARU YANG HILANG (Untuk memperbaiki error 500) ---
    /**
     * Mendapatkan riwayat booking milik pengguna.
     * Endpoint: GET /api/bookings/my-bookings
     */
    getMyBookings = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const bookings = await BookingService.getMyBookings(userId, page, limit);
        new apiResponse(res, 200, bookings, 'Riwayat booking berhasil diambil.');
    });
    // --- AKHIR FUNGSI BARU ---
        
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
