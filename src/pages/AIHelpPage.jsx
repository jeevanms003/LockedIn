import { motion } from "framer-motion";
import AIChatBox from "@/features/aiHelp/AIChatBox";
import { SparklesIcon } from "@heroicons/react/24/outline";
import "./AIHelpPage.css";

const AIHelpPage = () => {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get("topic");
  const initialQuery = topic ? `Explain ${topic} in simple terms` : "";

  return (
    <motion.div
      className="ai-help-page"
      data-theme={document.documentElement.getAttribute("data-theme") || "dark"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="floating-icons" aria-hidden="true">
        {/* Node Icon */}
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        {/* Binary Tree Icon */}
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="4" r="3" />
            <path d="M12 7 L9 10 M12 7 L15 10" />
            <circle cx="9" cy="13" r="3" />
            <circle cx="15" cy="13" r="3" />
          </svg>
        </div>
        {/* Array Icon */}
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="6" width="4" height="12" />
            <rect x="10" y="6" width="4" height="12" />
            <rect x="16" y="6" width="4" height="12" />
          </svg>
        </div>
        {/* Code Brackets Icon */}
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <path d="M7 8 L3 12 L7 16 M17 8 L21 12 L17 16" />
          </svg>
        </div>
        {/* Graph Edge Icon */}
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="18" r="3" />
            <path d="M6 6 L18 18" />
          </svg>
        </div>
      </div>
      <div className="page-wrapper">
        <header className="ai-help-header">
          <div className="header-left">
            <div className="ai-help-title-wrapper">
              <SparklesIcon className="title-icon" />
              <h1 className="ai-help-title">AI Help</h1>
            </div>
          </div>
          <div className="header-right">
            {/* Theme toggle removed */}
          </div>
        </header>
        <p className="ai-help-subtitle">
          Ask our AI about algorithms, data structures, or any coding concept!
        </p>
        <AIChatBox initialQuery={initialQuery} />
      </div>
    </motion.div>
  );
};

export default AIHelpPage;