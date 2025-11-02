const { logger } = require("./logger"); // Pastikan path impor logger benar

const errorHandler = (err, req, res, next) => {
    // 1. Ambil statusCode awal
    let statusCode = err.statusCode;

    // 2. Validasi: Pastikan statusCode adalah angka integer yang valid
    if (typeof statusCode !== 'number' || !Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
        // Jika tidak valid, log peringatan dan set default ke 500
        logger.warn(`Invalid or missing statusCode in error: ${err.statusCode}. Defaulting to 500.`);
        statusCode = 500;
    }

    // 3. Log error dengan statusCode yang sudah divalidasi
    logger.error(
        `[${req.method}] ${req.originalUrl} - ${statusCode} - ${err.message}`,
        { 
            // Tambahkan detail error validasi jika ada
            errors: err.errors, 
            // Tampilkan stack trace hanya di development
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, 
            // Data request untuk debugging
            body: req.body, 
            params: req.params, 
            query: req.query 
        }
    );

    // 4. Kirim respons JSON dengan statusCode yang sudah pasti integer
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Terjadi kesalahan internal pada server.' : (err.message || 'Terjadi kesalahan.'), // Pesan generik untuk 500
        errors: statusCode !== 500 ? (err.errors || null) : null, // Hanya kirim detail error jika bukan 500
    });
};

module.exports = errorHandler;