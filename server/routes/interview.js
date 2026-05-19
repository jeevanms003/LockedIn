const express = require("express");
const Progress = require("../models/Progress");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "apikey";

// Helper function to call Gemini
async function callGemini(contents, systemInstruction = "") {
  try {
    const payload = {
      contents: contents,
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    throw new Error("No response from Gemini");
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

// 1. Analyze user code (DSA feedback)
router.post("/analyze-code", authMiddleware, async (req, res) => {
  const { problemTitle, problemDescription, userCode, language } = req.body;

  if (!problemTitle || !userCode) {
    return res.status(400).json({ error: "problemTitle and userCode are required" });
  }

  const systemInstruction = `You are LockedIn DSA Evaluator, a senior software engineer at a top-tier tech firm. Your job is to analyze the user's DSA code submission and provide rigorous, highly educational feedback.
Return a review with:
- **Correctness Score** (1-10) and explanation.
- **Time Complexity** (Big-O analysis and if it is optimal).
- **Space Complexity** (Big-O analysis).
- **Code Quality & Cleanliness** (style, naming, structure).
- **Refactoring & Optimizations** (explain alternative optimal algorithms or patterns if any).
Be encouraging but direct and professional. Use markdown formatting. Include code snippets in your feedback if helpful.`;

  const prompt = `Please evaluate the following coding submission:
Problem: ${problemTitle}
Description: ${problemDescription || "N/A"}
Programming Language: ${language || "Javascript"}

User's Code:
\`\`\`${language || "javascript"}
${userCode}
\`\`\``;

  try {
    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    const feedback = await callGemini(contents, systemInstruction);
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: `Failed to analyze code: ${error.message}` });
  }
});

// 2. Chatbot Mock Interview - Next Turn
router.post("/chat", authMiddleware, async (req, res) => {
  const { category, topic, history, message } = req.body;
  // history is expected to be an array of: { role: 'user'|'assistant', content: string }
  // message is the latest response from the user (if any)

  if (!category || !topic) {
    return res.status(400).json({ error: "category and topic are required" });
  }

  const systemInstruction = `You are LockedIn AI, a senior recruiter and technical interviewer conducting a mock interview.
Category: ${category}
Topic/Focus: ${topic}

Rules:
1. Conduct a realistic interview by asking one clear, targeted question at a time.
2. Do not offer feedback, corrections, or scores *during* the chat. Keep the conversation moving.
3. Be professional, engaging, and challenging, adapting your questions based on the user's answers.
4. Keep answers relatively brief.
5. If the user indicates they want to wrap up, or you have asked 4-5 questions, conclude by saying: "[INTERVIEW_COMPLETE] Thank you for your time. I will now generate your feedback report. Please click 'Complete Interview'."
6. To begin, if history is empty, introduce yourself, state the topic of the interview, and ask the first question.`;

  try {
    // Map roles: model expects "user" and "model"
    const contents = [];
    if (history && history.length > 0) {
      history.forEach((turn) => {
        contents.push({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.content }],
        });
      });
    }

    if (message) {
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });
    } else if (contents.length === 0) {
      // First turn initiation
      contents.push({
        role: "user",
        parts: [{ text: `Hello, I'm ready to start my ${category} mock interview on "${topic}".` }],
      });
    }

    const aiResponse = await callGemini(contents, systemInstruction);
    res.json({ message: aiResponse });
  } catch (error) {
    res.status(500).json({ error: `Failed to generate interview response: ${error.message}` });
  }
});

// 3. Complete and Evaluate Interview
router.post("/evaluate", authMiddleware, async (req, res) => {
  const { category, topic, history } = req.body;

  if (!category || !topic || !history || history.length === 0) {
    return res.status(400).json({ error: "Category, topic, and interview history are required." });
  }

  const systemInstruction = `You are LockedIn Mock Interview Evaluator.
Analyze the following interview conversation transcript between the User and the AI Interviewer.
Provide a detailed evaluation report.
You must output a response containing:
1. An overall score from 0 to 100. Write it clearly at the very beginning, like: "Overall Score: [Score]/100" (e.g. "Overall Score: 85/100").
2. Strengths: Detail 2-3 things the user did very well.
3. Improvement Areas: Detail 2-3 specific suggestions for better answers.
4. Summary Report: A short paragraph summarising their performance.

Use markdown format. Keep your critique detailed, actionable, and structured.`;

  // Construct transcript text for prompt
  const transcript = history
    .map((turn) => `${turn.role === "assistant" ? "Interviewer" : "Candidate"}: ${turn.content}`)
    .join("\n\n");

  const prompt = `Please evaluate this interview transcript:
Category: ${category}
Topic: ${topic}

Transcript:
${transcript}`;

  try {
    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    const evaluationReport = await callGemini(contents, systemInstruction);

    // Extract score from text (look for "Overall Score: XX/100" or similar)
    let score = 75; // Default score fallback
    const scoreMatch = evaluationReport.match(/Overall Score:\s*(\d+)\/100/i);
    if (scoreMatch && scoreMatch[1]) {
      score = parseInt(scoreMatch[1], 10);
    }

    // Save to user's Progress document
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new Progress({ userId: req.user.id, completedProblems: [], solutions: {} });
    }

    const interviewAttempt = {
      category,
      topic,
      date: new Date(),
      score,
      feedback: evaluationReport,
      history: history.map((turn) => ({
        role: turn.role,
        content: turn.content,
      })),
    };

    progress.interviews.push(interviewAttempt);
    await progress.save();

    res.json({
      success: true,
      report: evaluationReport,
      score,
      interview: interviewAttempt,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to evaluate interview: ${error.message}` });
  }
});

module.exports = router;
