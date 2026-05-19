const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Progress = require("../models/Progress");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "lockedin_jwt_secret_key_12345";

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please enter all fields" });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with that email or username" });
    }

    // Create user
    const user = new User({ username, email, password });
    await user.save();

    // Create progress document
    const progress = new Progress({ userId: user._id, completedProblems: [], solutions: {} });
    await progress.save();

    // Generate Token
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: "Please enter all fields" });
  }

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate Token
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Get user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

module.exports = router;
