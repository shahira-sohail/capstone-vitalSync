const rateLimit = require("express-rate-limit");

const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    keyGenerator: (req) => req.user.userId,
    validate: {
        keyGeneratorIpFallback: false,
    },

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many AI requests. Please try again after 15 minutes.",
    },
});

module.exports = aiRateLimiter;