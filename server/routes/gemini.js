const express = require("express");
const authMiddleware = require("../middleware/auth");
const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "apikey";

router.post("/", authMiddleware, async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const payload = {
      contents: [{ role: "user", parts: [{ text: query }] }],
      systemInstruction: {
        parts: [{ text: "You are LockedIn AI, a helpful virtual assistant and programming tutor. Answer the user's coding or career-related questions clearly and professionally." }],
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const answer = data.candidates[0].content.parts[0].text;
      return res.json({ answer });
    }
    throw new Error("No response from Gemini");
  } catch (error) {
    console.error("Gemini chatbot error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
