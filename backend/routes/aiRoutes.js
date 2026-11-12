const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const { aiSuggestionSchema } = require("../validators/aiValidator");
const { generateAISuggestion } = require("../services/aiService");
const aiRateLimiter = require("../middleware/aiRateLimiter");

router.post(
    "/suggest",
    authMiddleware,
    validateRequest(aiSuggestionSchema),
    aiRateLimiter,
    async (req, res) => {
        try {
            const { prompt } = req.body;

            const suggestion = await generateAISuggestion(prompt);

            if (!suggestion) {
                return res.status(502).json({
                    success: false,
                    message: "AI service returned an empty response",
                });
            }

            return res.status(200).json({
                success: true,
                message: "AI suggestion generated successfully",
                suggestion,
            });
        } catch (error) {
            console.error("AI suggestion error:", error);

            return res.status(502).json({
                success: false,
                message: "AI service is temporarily unavailable",
            });
        }
    }
);

module.exports = router;