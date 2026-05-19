const mongoose = require("mongoose");

const InterviewAttemptSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  score: {
    type: Number,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
  history: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      evaluation: { type: String },
    },
  ],
});

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    completedProblems: [
      {
        type: String, // Problem ID
      },
    ],
    solutions: {
      type: Map,
      of: String, // problemId -> code content
    },
    interviews: [InterviewAttemptSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", ProgressSchema);
