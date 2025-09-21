const { path } = require("../../../server");
const logger = require("../../utils/logger");

// Middleware penanganan error
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // Log error
    logger.error(
        `[${req.method}] ${req.originalUrl} - ${statusCode} - ${err.message}`,
        { stack: err.stack, body: req.body, params: req.params, query: req.query }
    );

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server',
        errors: err.errors || null,
    });
};

module.exports = errorHandler;
