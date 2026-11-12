const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const generateAISuggestion = async (prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            maxOutputTokens: 500,
            httpOptions: {
                timeout: 30000,
            },
        },
    });

    return response.text?.trim() || null;
};

module.exports = {
    generateAISuggestion,
};