import { motion } from "framer-motion";

const ProgressBar = ({ total, completed }) => {
  const percent = total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0;

  return (
    <div className="progress-bar">
      <div className="progress-container">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </div>
      <p className="progress-text">{percent}% completed</p>
    </div>
  );
};

export default ProgressBar;