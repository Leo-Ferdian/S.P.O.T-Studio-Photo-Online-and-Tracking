const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');

// Winston logger instance
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'phourto-api' },
    transports: [
        // Log ke console
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),

        // Log ke file
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
});

// Middleware morgan untuk request logging
const morganMiddleware = morgan('combined', {
    stream: {
        write: (message) => logger.http(message.trim())
    }
});

// Tambahkan level custom `http` agar bisa dipakai morgan
logger.levels.http = 4;

module.exports = { logger, morganMiddleware };
