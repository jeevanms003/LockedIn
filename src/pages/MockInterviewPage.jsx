import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/features/auth/AuthContext";
import { useProgress } from "@/features/progress/useProgress";
import {
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  SparklesIcon,
  StopIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import "./MockInterviewPage.css";

const MockInterviewPage = () => {
  const { isAuthenticated, token } = useAuth();
  const { refreshProgress } = useProgress();
  const navigate = useNavigate();

  // Setup / Config State
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [category, setCategory] = useState("Behavioral");
  const [topic, setTopic] = useState("Conflict Resolution");
  const [useWebcam, setUseWebcam] = useState(true);
  const [useAudio, setUseAudio] = useState(false);

  // Live Interview State
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);

  // Camera stream ref
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState(null);

  // Start webcam
  useEffect(() => {
    if (interviewStarted && useWebcam && !interviewComplete) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: useAudio })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => {
          console.warn("Camera/Mic access denied or not available:", err);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [interviewStarted, useWebcam, useAudio, interviewComplete]);

  // Trigger first question
  const startInterview = async () => {
    setInterviewStarted(true);
    setIsAIResponding(true);
    setChatHistory([]);
    setInterviewComplete(false);
    setEvaluationReport(null);

    try {
      const res = await fetch("http://localhost:3001/api/interview/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category,
          topic,
          history: [],
          message: null, // trigger introduction
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start interview");

      setChatHistory([{ role: "assistant", content: data.message }]);
    } catch (err) {
      console.error(err);
      setChatHistory([
        {
          role: "assistant",
          content: `Could not connect to LockedIn AI. Ensure the server is running and a valid Gemini API key is supplied.\n\nError: ${err.message}`,
        },
      ]);
    } finally {
      setIsAIResponding(false);
    }
  };

  const handleSendAnswer = async (e) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || isAIResponding) return;

    const userMsg = inputMsg;
    setInputMsg("");

    // Append user message immediately
    const updatedHistory = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(updatedHistory);
    setIsAIResponding(true);

    try {
      const res = await fetch("http://localhost:3001/api/interview/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category,
          topic,
          history: updatedHistory.slice(0, -1),
          message: userMsg,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to chat with AI");

      const aiMsg = data.message;
      setChatHistory([...updatedHistory, { role: "assistant", content: aiMsg }]);

      // Check if interview completed flag was returned
      if (aiMsg.includes("[INTERVIEW_COMPLETE]")) {
        setInterviewComplete(true);
      }
    } catch (err) {
      console.error(err);
      setChatHistory([
        ...updatedHistory,
        {
          role: "assistant",
          content: `Unable to get a response. Error: ${err.message}`,
        },
      ]);
    } finally {
      setIsAIResponding(false);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch("http://localhost:3001/api/interview/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          category,
          topic,
          history: chatHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");

      setEvaluationReport(data);
      if (isAuthenticated) {
        refreshProgress(); // Sync database changes to local state
      }
    } catch (err) {
      console.error(err);
      alert(`Could not compile feedback. Details: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEndEarly = () => {
    if (window.confirm("Are you sure you want to end this interview now? You can still get AI evaluation of the answers you submitted.")) {
      setInterviewComplete(true);
    }
  };

  return (
    <div className="interview-room-container">
      {/* 1. Setup / Config Screen */}
      {!interviewStarted && (
        <motion.div
          className="interview-setup-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="setup-header">
            <ChatBubbleLeftRightIcon className="setup-icon" />
            <h2>LockedIn AI Mock Interview Room</h2>
            <p>Practice simulated technical and behavioral interviews with real-time feedback.</p>
          </div>

          <div className="setup-form">
            <div className="form-group">
              <label>Interview Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Behavioral">Behavioral / HR</option>
                <option value="DSA & Coding">Coding & DSA Logic</option>
                <option value="System Design">System Design & Architecture</option>
                <option value="General Tech">Full Stack trivia</option>
              </select>
            </div>

            <div className="form-group">
              <label>Focus Topic / Job Role</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. React Frontend Engineer, Conflict Resolution, System scalability"
              />
            </div>

            <div className="form-group toggles">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={useWebcam}
                  onChange={(e) => setUseWebcam(e.target.checked)}
                />
                <span>Enable Simulated Webcam Feed</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={useAudio}
                  onChange={(e) => setUseAudio(e.target.checked)}
                />
                <span>Enable Microphone Widget</span>
              </label>
            </div>

            {!isAuthenticated && (
              <div className="guest-warning">
                ⚠️ You are in guest mode. Your evaluation report will not be saved.{" "}
                <Link to="/auth">Sign In</Link> to save reports to your user dashboard.
              </div>
            )}

            <button onClick={startInterview} className="start-interview-btn">
              Start Mock Interview
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. Active Interview Screen */}
      {interviewStarted && !evaluationReport && (
        <div className="active-interview-layout">
          {/* Left panel: Media feed */}
          <div className="media-pane">
            <div className="video-card">
              {useWebcam ? (
                <video ref={videoRef} autoPlay playsInline muted className="webcam-feed" />
              ) : (
                <div className="webcam-placeholder">
                  <VideoCameraSlashIcon className="placeholder-icon" />
                  <span>Webcam Stream Disabled</span>
                </div>
              )}
              <div className="stream-badge">
                <span className="live-dot"></span> LIVE INTERVIEW FEED
              </div>
            </div>

            <div className="interview-meta-details">
              <h3>Session Specs</h3>
              <p>
                <strong>Category:</strong> {category}
              </p>
              <p>
                <strong>Focus:</strong> {topic}
              </p>
              {useAudio && (
                <div className="mic-meter">
                  <MicrophoneIcon className="mic-icon animate-pulse" />
                  <span>Microphone Active (typing submission enabled)</span>
                </div>
              )}
            </div>

            <button onClick={handleEndEarly} className="end-early-btn">
              <StopIcon className="end-icon" /> End & Get Feedback
            </button>
          </div>

          {/* Right panel: Chat feed */}
          <div className="chat-pane">
            <div className="chat-log-wrapper">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-bubble-container ${msg.role}`}>
                  <div className="bubble-author">
                    {msg.role === "assistant" ? "Interviewer" : "You"}
                  </div>
                  <div className="chat-bubble">
                    {msg.content.replace("[INTERVIEW_COMPLETE]", "")}
                  </div>
                </div>
              ))}
              {isAIResponding && (
                <div className="chat-bubble-container assistant">
                  <div className="bubble-author">Interviewer</div>
                  <div className="chat-bubble loading">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-footer-input">
              {interviewComplete ? (
                <div className="completion-block">
                  <p>Interview concluded. Click below to generate your performance report.</p>
                  <button
                    onClick={handleEvaluate}
                    disabled={isEvaluating}
                    className="evaluate-btn"
                  >
                    {isEvaluating ? (
                      <>
                        <ArrowPathIcon className="animate-spin btn-icon" />
                        Generating Feedback...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="btn-icon" />
                        Complete Interview & View Report
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendAnswer} className="chat-input-form">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Type your response to the interviewer's question..."
                    disabled={isAIResponding}
                  />
                  <button type="submit" disabled={isAIResponding || !inputMsg.trim()}>
                    Submit
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Evaluation Report Screen */}
      {evaluationReport && (
        <motion.div
          className="evaluation-report-card"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <header className="report-header">
            <ChartBarIcon className="report-icon" />
            <h2>Interview Feedback Report</h2>
            <div className="score-badge">
              Score: <span className="score-num">{evaluationReport.score}/100</span>
            </div>
          </header>

          <div className="report-body">
            <ReactMarkdown>{evaluationReport.report}</ReactMarkdown>
          </div>

          <footer className="report-footer">
            <button
              onClick={() => {
                setInterviewStarted(false);
                setChatHistory([]);
                setInterviewComplete(false);
                setEvaluationReport(null);
              }}
              className="retry-btn"
            >
              Start New Mock Session
            </button>
            {isAuthenticated ? (
              <button onClick={() => navigate("/dashboard")} className="dashboard-btn">
                Go to Dashboard
              </button>
            ) : (
              <div className="auth-prompt">
                💡 <Link to="/auth">Sign In</Link> next time to persist this report in your cloud dashboard.
              </div>
            )}
          </footer>
        </motion.div>
      )}
    </div>
  );
};

export default MockInterviewPage;
