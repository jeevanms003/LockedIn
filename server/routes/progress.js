const express = require("express");
const Progress = require("../models/Progress");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get user progress
router.get("/", authMiddleware, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      // Create if it doesn't exist for some reason
      progress = new Progress({ userId: req.user.id, completedProblems: [], solutions: {} });
      await progress.save();
    }
    res.json(progress);
  } catch (err) {
    console.error("Fetch progress error:", err);
    res.status(500).json({ error: "Server error fetching progress" });
  }
});

// Toggle problem completion
router.post("/toggle-complete", authMiddleware, async (req, res) => {
  const { problemId } = req.body;
  if (!problemId) {
    return res.status(400).json({ error: "problemId is required" });
  }

  try {
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new Progress({ userId: req.user.id, completedProblems: [], solutions: {} });
    }

    const index = progress.completedProblems.indexOf(problemId);
    if (index > -1) {
      // Remove it
      progress.completedProblems.splice(index, 1);
    } else {
      // Add it
      progress.completedProblems.push(problemId);
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error("Toggle complete error:", err);
    res.status(500).json({ error: "Server error toggling problem status" });
  }
});

// Save code solution
router.post("/save-solution", authMiddleware, async (req, res) => {
  const { problemId, code } = req.body;
  if (!problemId) {
    return res.status(400).json({ error: "problemId is required" });
  }

  try {
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new Progress({ userId: req.user.id, completedProblems: [], solutions: {} });
    }

    if (!progress.solutions) {
      progress.solutions = new Map();
    }

    progress.solutions.set(problemId, code);
    await progress.save();

    res.json({ success: true, solutions: progress.solutions });
  } catch (err) {
    console.error("Save solution error:", err);
    res.status(500).json({ error: "Server error saving code solution" });
  }
});

module.exports = router;
