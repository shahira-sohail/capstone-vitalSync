// Handle routes that do not exist
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
    });
};

// Handle all server errors
const errorHandler = (err, req, res, next) => {
    console.error("Server Error:", err);

    // If response has already been sent
    if (res.headersSent) {
        return next(err);
    }

    const requestedStatus = err.status || err.statusCode;

    const statusCode =
        Number.isInteger(requestedStatus) &&
        requestedStatus >= 400 &&
        requestedStatus <= 599
            ? requestedStatus
            : 500;

    res.status(statusCode).json({
        success: false,
        message: statusCode >= 500
            ? "Internal Server Error"
            : "Request failed",
    });
};

module.exports = {
    notFound,
    errorHandler,
};