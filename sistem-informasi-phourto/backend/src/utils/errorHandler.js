const { logger } = require("./logger");

// Middleware penanganan error
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;

    // --- PERBAIKAN: Tangani error validasi dari express-validator ---
    // Error validasi mungkin tidak memiliki statusCode, tapi memiliki 'errors'
    if (err.errors && Array.isArray(err.errors) && err.errors[0]?.msg) {
        statusCode = 400; // Paksa jadi 400
    }
    // --- AKHIR PERBAIKAN ---

    // --- PERBAIKAN: Hanya log jika BUKAN mode tes ---
    if (process.env.NODE_ENV !== 'test') {
        logger.error(
            `[${req.method}] ${req.originalUrl} - ${statusCode} - ${err.message}`,
            { stack: err.stack } // Disederhanakan agar tidak terlalu ramai
        );
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server',
        errors: err.errors || null,
    });
};

module.exports = errorHandler;