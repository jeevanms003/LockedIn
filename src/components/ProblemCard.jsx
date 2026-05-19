import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProgress } from "@/features/progress/useProgress";
import { PlayCircleIcon, SparklesIcon, CheckCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import "./ProblemCard.css";

const ProblemCard = ({ title, description, solution, id, topic, number, difficulty, link }) => {
  const [showSolution, setShowSolution] = useState(false);
  const { completedProblems, toggleProblemComplete } = useProgress();
  const navigate = useNavigate();
  const problemId = String(id); // Normalize to string
  const isCompleted = completedProblems.includes(problemId);

  const handleToggleComplete = () => {
    toggleProblemComplete(problemId);
  };

  const handleSolveClick = () => {
    navigate(`/solve/${problemId}`);
  };

  return (
    <motion.div
      className="problem-card"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="problem-header">
        <div className="title-wrapper">
          <h3 className="problem-title">{`${number}. ${title}`}</h3>
          {isCompleted && (
            <span className="completion-icon-wrapper" title="Problem Completed" aria-label="Problem Completed">
              <CheckCircleIcon className="completion-icon" aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="problem-meta">
          {topic && <span className="problem-category">{topic}</span>}
          {difficulty && (
            <span
              className={`problem-difficulty difficulty-${difficulty.toLowerCase()}`}
              aria-label={`Difficulty: ${difficulty}`}
            >
              {difficulty}
            </span>
          )}
        </div>
      </div>
      <div className="problem-actions">
        <motion.button
          className="action-button youtube"
          onClick={() =>
            window.open(
              `https://www.youtube.com/results?search_query=${encodeURIComponent(
                title + " DSA problem explanation"
              )}`,
              "_blank"
            )
          }
          title="Search for videos on YouTube"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Search YouTube for problem explanation"
        >
          <PlayCircleIcon className="action-icon" />
          <span>YouTube</span>
        </motion.button>
        <motion.button
          className="action-button ai"
          onClick={() =>
            window.open(`/ai-help?topic=${encodeURIComponent(title)}`, "_blank")
          }
          title="Ask AI about this problem"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open AI Help for this problem in a new tab"
        >
          <SparklesIcon className="action-icon" />
          <span>AI Help</span>
        </motion.button>
        <motion.button
          className="action-button solve"
          onClick={handleSolveClick}
          title="Solve in Workspace Editor"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Solve this problem in Workspace Editor"
        >
          <ArrowRightCircleIcon className="action-icon" />
          <span>Code Editor</span>
        </motion.button>
        <motion.button
          className={`action-button complete ${isCompleted ? "completed" : ""}`}
          onClick={handleToggleComplete}
          title={isCompleted ? "Undo Completion" : "Mark Problem as Complete"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isCompleted ? "Undo problem completion" : "Mark problem as complete"}
        >
          <CheckCircleIcon className="action-icon" />
          <span>{isCompleted ? "Completed" : "Complete"}</span>
        </motion.button>
      </div>
      <p className="problem-description">{description}</p>
      <motion.button
        className="solution-button"
        onClick={() => setShowSolution((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={showSolution ? "Hide solution" : "Show solution"}
      >
        {showSolution ? "Hide Solution" : "Show Solution"}
      </motion.button>
      {showSolution && (
        <motion.div
          className="problem-solution"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <pre className="code-block">{solution}</pre>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProblemCard;