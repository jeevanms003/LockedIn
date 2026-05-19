import { useState, useEffect } from "react";
import { useProgress } from "@/features/progress/useProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ProblemCard = ({ number, title, description, solution, id, topic, difficulty, isCompleted }) => {
  const [showSolution, setShowSolution] = useState(false);
  const { markProblemComplete, completedProblems, toggleProblemComplete } = useProgress();

  useEffect(() => {
    if (showSolution && id) {
      markProblemComplete(id);
    }
  }, [showSolution, id, markProblemComplete]);

  return (
    <div className="problem-card">
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
      <p className="problem-description">{description}</p>
      <button
        className="solution-button"
        onClick={() => setShowSolution((prev) => !prev)}
      >
        {showSolution ? "Hide Solution" : "Show Solution"}
      </button>
      {showSolution && (
        <div className="problem-solution">
          {solution.split("\n").map((line, index) => (
            <pre key={index}>{line}</pre>
          ))}
        </div>
      )}
      <button
        className="completion-toggle"
        onClick={() => toggleProblemComplete(id)}
        title={completedProblems.includes(id) ? "Mark as incomplete" : "Mark as complete"}
      >
        {completedProblems.includes(id) ? "✔" : "○"}
      </button>
    </div>
  );
};

export default ProblemCard;