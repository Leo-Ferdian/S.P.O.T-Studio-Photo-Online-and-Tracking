function errorHandler(err, req, res, next) {
    console.error(err); // Bisa diganti logger (winston, pino, dll.)

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan pada server.';

    res.status(statusCode).json({
        success: false,
        message
    });
}

module.exports = errorHandler;
