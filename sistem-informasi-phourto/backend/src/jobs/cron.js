const cron = require('node-cron');
const BookingService = require('../api/services/booking.service');
const { logger } = require('../utils/logger');

// Inisialisasi Cron Jobs
const initCronJobs = () => {
    logger.info('Inisialisasi Cron Jobs...');

    // --- JOB 1: Expire Booking Lama ---
    // Jalankan setiap 1 menit (untuk akurasi tinggi)
    // Pola Cron: "* * * * *" (Setiap menit)
    cron.schedule('* * * * *', async () => {
        // logger.debug('[Cron] Memeriksa booking yang kadaluwarsa...'); 
        try {
            const count = await BookingService.expireOldBookings();
            if (count > 0) {
                logger.info(`[Cron] ${count} booking telah diubah menjadi EXPIRED.`);
            }
        } catch (error) {
            logger.error('[Cron] Gagal menjalankan expireOldBookings:', error);
        }
    });

    logger.info('Cron Jobs berhasil dijadwalkan.');
};

module.exports = initCronJobs;
