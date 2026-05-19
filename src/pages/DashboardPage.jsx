import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/features/auth/AuthContext";
import { useProgress } from "@/features/progress/useProgress";
import problemsList from "@/features/practice/data/problems.json";
import {
  SparklesIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  CalendarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import "./DashboardPage.css";

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { completedProblems, interviews, solutions, isLoading: progressLoading } = useProgress();
  const navigate = useNavigate();

  // Modal display states
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || progressLoading) {
    return (
      <div className="dashboard-loading-screen">
        <div className="spinner"></div>
        <p>Fetching your progress dashboard...</p>
      </div>
    );
  }

  const totalDsaCount = problemsList.length;
  const completedDsaCount = completedProblems.length;
  const dsaPercentage = Math.round((completedDsaCount / totalDsaCount) * 100) || 0;

  const totalInterviews = interviews.length;
  const averageScore = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, curr) => acc + curr.score, 0) / totalInterviews)
    : 0;

  // Format date helper
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-outer-container">
      {/* Welcome Banner */}
      <motion.header
        className="dashboard-welcome-banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="welcome-text">
          <h1>Hello, {user?.username || "Learner"}!</h1>
          <p>Track your preparation analytics and refine your interview skills.</p>
        </div>
        <div className="welcome-quick-actions">
          <Link to="/practice" className="action-btn dsa">
            <CodeBracketIcon className="btn-icon" /> Practice DSA
          </Link>
          <Link to="/mock-interview" className="action-btn interview">
            <ChatBubbleLeftRightIcon className="btn-icon" /> Mock Interview
          </Link>
        </div>
      </motion.header>

      {/* Grid of Key Stats */}
      <section className="stats-dashboard-grid">
        {/* Stat 1: DSA completion */}
        <motion.div
          className="dashboard-stat-card"
          whileHover={{ translateY: -3 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-top">
            <AcademicCapIcon className="stat-icon dsa-icon" />
            <h3>DSA Mastery</h3>
          </div>
          <div className="card-middle">
            <span className="huge-number">{completedDsaCount}</span>
            <span className="smaller-label">/ {totalDsaCount} solved</span>
          </div>
          <div className="card-bottom">
            <div className="dashboard-progress-track">
              <div
                className="dashboard-progress-fill"
                style={{ width: `${dsaPercentage}%` }}
              ></div>
            </div>
            <span className="percentage-text">{dsaPercentage}% completed</span>
          </div>
        </motion.div>

        {/* Stat 2: Mock Interview count */}
        <motion.div
          className="dashboard-stat-card"
          whileHover={{ translateY: -3 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-top">
            <ChatBubbleLeftRightIcon className="stat-icon interview-icon" />
            <h3>Mock Interviews</h3>
          </div>
          <div className="card-middle">
            <span className="huge-number">{totalInterviews}</span>
            <span className="smaller-label">sessions completed</span>
          </div>
          <div className="card-bottom">
            <span className="subtext-label">AI evaluated practice loops</span>
          </div>
        </motion.div>

        {/* Stat 3: Avg Interview Score */}
        <motion.div
          className="dashboard-stat-card"
          whileHover={{ translateY: -3 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-top">
            <StarIcon className="stat-icon score-icon" />
            <h3>Average Score</h3>
          </div>
          <div className="card-middle">
            <span className="huge-number">{averageScore}</span>
            <span className="smaller-label">% average</span>
          </div>
          <div className="card-bottom">
            <span
              className={`score-indicator-badge ${
                averageScore >= 80 ? "good" : averageScore >= 50 ? "avg" : "bad"
              }`}
            >
              {averageScore >= 80 ? "Strong Fit" : averageScore >= 50 ? "Growth Needed" : "Practice Daily"}
            </span>
          </div>
        </motion.div>
      </section>

      {/* Main content columns */}
      <div className="dashboard-columns-layout">
        {/* Column 1: Recent Interviews */}
        <div className="dash-column left">
          <h2>
            <ChatBubbleLeftRightIcon className="sec-icon" /> Recent Mock Interviews
          </h2>
          <div className="list-card-box">
            {interviews.length === 0 ? (
              <div className="empty-placeholder-card">
                <p>No interviews completed yet.</p>
                <Link to="/mock-interview" className="inline-cta-btn">
                  Start your first mock interview
                </Link>
              </div>
            ) : (
              <div className="interviews-list-items">
                {interviews
                  .slice()
                  .reverse()
                  .map((session, idx) => (
                    <div key={session._id || idx} className="session-item-row">
                      <div className="session-left-meta">
                        <h4>{session.topic}</h4>
                        <div className="sub-row">
                          <span className="category-pill">{session.category}</span>
                          <span className="date-text">
                            <CalendarIcon className="date-icon" /> {formatDate(session.date)}
                          </span>
                        </div>
                      </div>
                      <div className="session-right-actions">
                        <div
                          className={`session-score-circle ${
                            session.score >= 80 ? "good" : session.score >= 50 ? "avg" : "bad"
                          }`}
                        >
                          {session.score}
                        </div>
                        <button
                          onClick={() => setSelectedReport(session)}
                          className="view-report-mini-btn"
                        >
                          View Report
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Code Submissions */}
        <div className="dash-column right">
          <h2>
            <CodeBracketIcon className="sec-icon" /> Saved Code Solutions
          </h2>
          <div className="list-card-box">
            {Object.keys(solutions).length === 0 ? (
              <div className="empty-placeholder-card">
                <p>No saved code solutions found.</p>
                <Link to="/practice" className="inline-cta-btn">
                  Start coding practice
                </Link>
              </div>
            ) : (
              <div className="solutions-list-items">
                {Object.entries(solutions).map(([probId, savedCode]) => {
                  const prob = problemsList.find((p) => p.id === probId);
                  return (
                    <div key={probId} className="solution-item-row">
                      <div className="sol-meta">
                        <h4>{prob?.title || `Problem ${probId}`}</h4>
                        <span className="diff-pill">{prob?.difficulty || "DSA"}</span>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedSolution({
                            title: prob?.title || `Problem ${probId}`,
                            code: savedCode,
                          })
                        }
                        className="view-code-btn"
                      >
                        View Code
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. Modal for Interview Report */}
      <AnimatePresence>
        {selectedReport && (
          <div className="dashboard-modal-overlay">
            <motion.div
              className="dashboard-modal-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="modal-header-dash">
                <div>
                  <h2>Interview Evaluation</h2>
                  <p>{selectedReport.topic} • {selectedReport.category}</p>
                </div>
                <button className="close-btn-dash" onClick={() => setSelectedReport(null)}>
                  &times;
                </button>
              </div>
              <div className="modal-body-dash">
                <div className="modal-score-banner">
                  Score: <span>{selectedReport.score}/100</span>
                </div>
                <div className="markdown-feedback-view">
                  <ReactMarkdown>{selectedReport.feedback}</ReactMarkdown>
                </div>
              </div>
              <div className="modal-footer-dash">
                <button className="close-btn-footer-dash" onClick={() => setSelectedReport(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal for Code Solutions */}
      <AnimatePresence>
        {selectedSolution && (
          <div className="dashboard-modal-overlay">
            <motion.div
              className="dashboard-modal-card code-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="modal-header-dash">
                <div>
                  <h2>Saved Code Solution</h2>
                  <p>{selectedSolution.title}</p>
                </div>
                <button className="close-btn-dash" onClick={() => setSelectedSolution(null)}>
                  &times;
                </button>
              </div>
              <div className="modal-body-dash">
                <pre className="saved-code-view">
                  <code>{selectedSolution.code}</code>
                </pre>
              </div>
              <div className="modal-footer-dash">
                <button
                  className="close-btn-footer-dash"
                  onClick={() => setSelectedSolution(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
