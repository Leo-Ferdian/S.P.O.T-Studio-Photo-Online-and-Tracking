const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        splat(),
        json()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new transports.Console({
            format: combine(
                colorize(),
                simple(),
                printf(({ level, message, timestamp }) => {
                    return `${timestamp} [${level}]: ${message}`;
                    }
                )
            )
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
});

module.exports = logger;