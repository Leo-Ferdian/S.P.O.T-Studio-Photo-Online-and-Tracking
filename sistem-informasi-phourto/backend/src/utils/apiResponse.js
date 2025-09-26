/**
 * @class ApiResponse
 * @description A standardized class for sending consistent API responses.
 * This utility helps ensure that all successful responses from the API
 * follow the same structure, making it easier for the frontend to consume.
 * It directly sends the response back to the client.
 */
class ApiResponse {
    /**
     * Sends a JSON response with a standardized format for successful operations.
     * @param {object} res - The Express response object.
     * @param {number} statusCode - The HTTP status code (e.g., 200 for OK, 201 for Created).
     * @param {any} data - The data payload to be included in the response. Can be an object, array, or null.
     * @param {string} - A descriptive message indicating the result of the operation.
     */
    constructor(res, statusCode, data, message = "Success") {
        res.status(statusCode).json({
            success: true, // This flag always indicates a successful operation
            statusCode: statusCode,
            message: message,
            data: data,
        });
    }
}

module.exports = ApiResponse;