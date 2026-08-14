import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

// Render gives us the PORT.
// 3000 is used when running locally.
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log(
    "API Key loaded:",
    process.env.GROQ_API_KEY ? "YES ✅" : "NO ❌"
);

const client = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.GROQ_API_KEY
});

app.post("/analyze", async (req, res) => {
    try {
        const chat = req.body.chat;

        if (!chat || !chat.trim()) {
            return res.status(400).json({
                error: "Conversation is required."
            });
        }

        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,

            messages: [
                {
                    role: "system",
                    content: `You are an expert relationship conversation analyzer.

Analyze the conversation carefully and objectively.

Return ONLY valid JSON in this exact format:

{
  "score": 0,
  "level": "Low",
  "redFlags": [],
  "yellowFlags": [],
  "greenFlags": [],
  "analysis": "",
  "advice": "",
  "verdict": ""
}

Rules:

- score must be a whole number from 0 to 100.
- 0-24 = Low.
- 25-49 = Moderate.
- 50-74 = High.
- 75-100 = Extreme.
- level must be Low, Moderate, High, or Extreme.
- Do not automatically call anyone toxic or abusive.
- Only identify behavior supported by the conversation.
- Consider context.
- Do not invent information.
- redFlags should contain specific concerning behaviors.
- yellowFlags should contain behaviors worth paying attention to.
- greenFlags should contain healthy or positive behaviors.
- analysis should explain the overall conversation.
- advice should be practical and balanced.
- verdict should be a short overall conclusion.
- Return ONLY JSON.
- Do not use markdown.
`
                },
                {
                    role: "user",
                    content: chat
                }
            ]
        });

        const raw = response.choices?.[0]?.message?.content;

        console.log("AI RESPONSE:");
        console.log(raw);

        if (!raw) {
            return res.status(500).json({
                error: "AI returned an empty response."
            });
        }

        let result;

        try {
            result = JSON.parse(raw.trim());
        } catch (error) {
            console.error("JSON parsing failed:");
            console.error(raw);

            return res.status(500).json({
                error: "AI returned invalid JSON. Please try again."
            });
        }

        // Make sure score is valid
        let score = Number(result.score);

        if (Number.isNaN(score)) {
            score = 0;
        }

        score = Math.max(
            0,
            Math.min(100, Math.round(score))
        );

        result.score = score;

        // Make sure arrays exist
        if (!Array.isArray(result.redFlags)) {
            result.redFlags = [];
        }

        if (!Array.isArray(result.yellowFlags)) {
            result.yellowFlags = [];
        }

        if (!Array.isArray(result.greenFlags)) {
            result.greenFlags = [];
        }

        // Make sure text fields exist
        if (!result.analysis) {
            result.analysis = "No analysis available.";
        }

        if (!result.advice) {
            result.advice = "No advice available.";
        }

        if (!result.verdict) {
            result.verdict = "No verdict available.";
        }

        // Validate level
        const levels = [
            "Low",
            "Moderate",
            "High",
            "Extreme"
        ];

        if (!levels.includes(result.level)) {
            if (score >= 75) {
                result.level = "Extreme";
            } else if (score >= 50) {
                result.level = "High";
            } else if (score >= 25) {
                result.level = "Moderate";
            } else {
                result.level = "Low";
            }
        }

        res.json(result);

    } catch (error) {
        console.error("SERVER ERROR:", error);

        res.status(500).json({
            error: error.message || "AI analysis failed."
        });
    }
});

// Health check
app.get("/", (req, res) => {
    res.send("🚩 Red Flag Detector backend is running!");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `🚩 Red Flag Detector server running on port ${PORT}`
    );
});
