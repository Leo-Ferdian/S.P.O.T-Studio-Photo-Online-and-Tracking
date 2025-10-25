module.exports = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Utility to wrap async route handlers and pass errors to Express error handler

// Example usage:
// const asyncHandler = require('./utils/asyncHandler');
// app.get('/route', asyncHandler(async (req, res, next) => {