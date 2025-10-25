class apiError extends Error {
    constructor(message, statusCode, error = [], stack = '') {
        super(message);

        this.statusCode = statusCode;
        this.message = message;
        this.stack = stack;
        this.error = error;
        this.success = false;

        if(stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
        
    }
}

module.exports = apiError;