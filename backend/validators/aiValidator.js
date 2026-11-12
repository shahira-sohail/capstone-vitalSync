const { z } = require("zod");

const aiSuggestionSchema = z.object({
    prompt: z.string()
        .trim()
        .min(5, "Prompt must be at least 5 characters")
        .max(1000, "Prompt cannot exceed 1000 characters"),
}).strict();

module.exports = {
    aiSuggestionSchema,
};