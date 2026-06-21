require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const interviewRoutes = require("./routes/interview");
const geminiRoutes = require("./routes/gemini");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lockedin";

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // Align with Vite frontend URL
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB successfully at " + MONGODB_URI.split("@").pop()))
  .catch((err) => console.error("Failed to connect to MongoDB:", err.message));

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/gemini", geminiRoutes);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date(),
  });
});

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, "../dist")));

// Fallback to index.html for React SPA router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Start the Server
app.listen(PORT, () => {
  console.log(`LockedIn Backend Server running on http://localhost:${PORT}`);
});