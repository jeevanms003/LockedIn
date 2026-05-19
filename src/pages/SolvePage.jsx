import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useProgress } from "@/features/progress/useProgress";
import { useAuth } from "@/features/auth/AuthContext";
import problems from "@/features/practice/data/problems.json";
import {
  CommandLineIcon,
  PlayIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CheckIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import "./SolvePage.css";

const SolvePage = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const { completedProblems, toggleProblemComplete, saveCodeSolution, solutions } = useProgress();

  const problem = problems.find((p) => p.id === problemId);

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Initialize Code template
  useEffect(() => {
    if (problem) {
      // Check if we already have a saved solution
      if (solutions && solutions[problemId]) {
        setCode(solutions[problemId]);
      } else {
        // Fallback default templates
        const funcName = problem.title
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .split(" ")
          .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)))
          .join("");

        if (language === "javascript") {
          setCode(`/**\n * Problem: ${problem.title}\n */\nfunction ${funcName || "solve"}(input) {\n  // Write your code here\n  \n  return null;\n}`);
        } else if (language === "python") {
          setCode(`# Problem: ${problem.title}\ndef ${funcName || "solve"}(input):\n    # Write your code here\n    pass`);
        } else if (language === "cpp") {
          setCode(`// Problem: ${problem.title}\n#include <iostream>\nusing namespace std;\n\n// Write your code here\n`);
        } else {
          setCode(`// Problem: ${problem.title}\npublic class Solution {\n    // Write your code here\n}`);
        }
      }
    }
  }, [problem, problemId, language, solutions]);

  if (!problem) {
    return (
      <div className="solve-error-page">
        <h2>Problem not found</h2>
        <Link to="/practice" className="back-link">
          <ArrowLeftIcon className="icon" /> Back to Practice
        </Link>
      </div>
    );
  }

  const isCompleted = completedProblems.includes(problemId);

  const handleGetAIFeedback = async () => {
    setIsAnalyzing(true);
    setAiFeedback("");
    setShowFeedbackModal(true);
    try {
      const res = await fetch("http://localhost:3001/api/interview/analyze-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          problemTitle: problem.title,
          problemDescription: problem.description,
          userCode: code,
          language: language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze code");
      }
      setAiFeedback(data.feedback);
    } catch (err) {
      console.error(err);
      setAiFeedback(`### Error\nFailed to retrieve AI analysis. Please verify your connection or Gemini API key setting.\n\nDetails: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndComplete = async () => {
    setIsSaving(true);
    try {
      // Save code
      await saveCodeSolution(problemId, code);
      // Toggle completion if not already completed
      if (!isCompleted) {
        await toggleProblemComplete(problemId);
      }
      // Brief toast or feedback
      alert("Solution saved successfully and problem marked as completed!");
    } catch (err) {
      console.error(err);
      alert("Failed to save progress. It is saved locally in the browser.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="solve-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Top Header */}
      <header className="solve-nav-header">
        <button onClick={() => navigate("/practice")} className="back-btn">
          <ArrowLeftIcon className="icon-back" /> Back
        </button>
        <div className="solve-title-block">
          <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
          <h1>{problem.title}</h1>
        </div>
        <div className="solve-header-actions">
          <button
            className={`complete-status-btn ${isCompleted ? "completed" : ""}`}
            onClick={() => toggleProblemComplete(problemId)}
          >
            {isCompleted ? <CheckIcon className="icon-check" /> : null}
            {isCompleted ? "Completed" : "Mark Complete"}
          </button>
        </div>
      </header>

      {/* Main Workspace Split Pane */}
      <div className="solve-workspace">
        {/* Left Side: Details */}
        <div className="solve-left-pane">
          <div className="section-tab">Problem Description</div>
          <div className="pane-content">
            <div className="meta-row">
              <span className="topic-tag">{problem.topic}</span>
            </div>
            <p className="problem-text">{problem.description}</p>

            <div className="code-solution-hint-section">
              <h3>Expected Solution Hint</h3>
              <pre className="hint-solution-view">{problem.solution.split("```")[0]}</pre>
            </div>
            
            <div className="login-tip-banner">
              {!isAuthenticated && (
                <p>
                  💡 <strong>Tip:</strong> You are coding in Guest Mode.{" "}
                  <Link to="/auth">Sign In</Link> to save your codes permanently to the cloud
                  database.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Code Editor */}
        <div className="solve-right-pane">
          <div className="editor-controls">
            <div className="control-left">
              <CommandLineIcon className="ctrl-icon" />
              <span>Editor</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="language-select"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            <div className="control-right">
              <button
                className="btn-editor-action reset-btn"
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset your code?")) {
                    solutions[problemId] = "";
                    window.location.reload();
                  }
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="code-editor-wrapper">
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              placeholder="// Write your code solution here..."
            />
          </div>

          {/* Action Row */}
          <div className="editor-footer-actions">
            <button
              className="action-btn-solve ai-btn"
              onClick={handleGetAIFeedback}
              disabled={isAnalyzing}
            >
              <SparklesIcon className="btn-icon" />
              Get AI Feedback
            </button>
            <button
              className="action-btn-solve save-btn"
              onClick={handleSaveAndComplete}
              disabled={isSaving}
            >
              <CpuChipIcon className="btn-icon" />
              Save & Complete
            </button>
          </div>
        </div>
      </div>

      {/* AI Feedback Overlay Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="feedback-modal-overlay">
            <motion.div
              className="feedback-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>
                  <SparklesIcon className="modal-icon" /> AI Feedback & Critique
                </h2>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                {isAnalyzing ? (
                  <div className="loading-spinner-wrapper">
                    <div className="spinner"></div>
                    <p>LockedIn AI is reviewing your solution for Big-O complexity, edge cases, and quality...</p>
                  </div>
                ) : (
                  <div className="markdown-feedback-view">
                    <ReactMarkdown>{aiFeedback}</ReactMarkdown>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="close-btn-footer"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Close Feedback
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SolvePage;
