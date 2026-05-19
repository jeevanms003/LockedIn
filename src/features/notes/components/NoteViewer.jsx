import { useState } from "react";
import { motion } from "framer-motion";
import BookmarkButton from "@/components/BookmarkButton";
import useBookmarks from "@/features/bookmarks/useBookmarks";
import { useProgress } from "@/features/progress/useProgress";
import {
  PlayCircleIcon,
  SparklesIcon,
  BookmarkSquareIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

const NoteViewer = ({ topic, isLoading }) => {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { completedTopics, toggleTopicComplete } = useProgress();
  const [copied, setCopied] = useState(false);

  const topicId = String(topic?.id); // Normalize to string
  const isCompleted = completedTopics.includes(topicId);

  const handleToggleComplete = () => {
    console.log(`NoteViewer: Toggling completion for topicId = ${topicId}, current completedTopics =`, completedTopics);
    toggleTopicComplete(topicId);
  };

  const handleToggleBookmark = (topic) => {
    if (isBookmarked(topic.id)) {
      removeBookmark(topic.id);
    } else {
      addBookmark(topic);
    }
  };

  const handleCopyCode = () => {
    if (topic?.examples) {
      navigator.clipboard.writeText(topic.examples);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!topic) {
    return (
      <motion.div
        className="note-viewer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Select a topic to view notes.
      </motion.div>
    );
  }

  return (
    <motion.div
      className="note-viewer"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="note-header">
        <div className="title-wrapper">
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {topic.title}
          </motion.h2>
          {isCompleted && (
            <motion.span
              className="completion-icon-wrapper"
              title="Topic Completed"
              aria-label="Topic Completed"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircleIcon className="completion-icon" aria-hidden="true" />
            </motion.span>
          )}
        </div>
        <motion.div
          className="note-actions"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.button
            className="action-button youtube"
            onClick={() =>
              window.open(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(
                  topic.title + " DSA explanation"
                )}`,
                "_blank"
              )
            }
            title="Search for videos on YouTube"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Search YouTube for topic explanation"
          >
            <PlayCircleIcon className="action-icon" />
            <span>YouTube</span>
          </motion.button>
          <motion.button
            className="action-button ai"
            onClick={() =>
              window.open(
                `/ai-help?topic=${encodeURIComponent(topic.title)}`,
                "_blank"
              )
            }
            title="Ask AI about this topic"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open AI Help for this topic in a new tab"
          >
            <SparklesIcon className="action-icon" />
            <span>AI</span>
          </motion.button>
          <motion.button
            className={`action-button complete ${isCompleted ? "completed" : ""}`}
            onClick={handleToggleComplete}
            title={isCompleted ? "Undo Completion" : "Mark Topic as Complete"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isCompleted ? "Undo topic completion" : "Mark topic as complete"}
          >
            <CheckCircleIcon className={`action-icon ${isCompleted ? "completed" : ""}`} />
            <span>{isCompleted ? "Undo Complete" : "Mark Complete"}</span>
          </motion.button>
          <BookmarkButton
            topic={topic}
            isBookmarked={isBookmarked(topic.id)}
            onToggleBookmark={() => handleToggleBookmark(topic)}
            icon={<BookmarkSquareIcon className="action-icon" />}
            aria-label={`Bookmark ${topic.title}`}
          />
        </motion.div>
      </div>
      <div className="note-content">
        {isLoading ? (
          <div className="skeleton skeleton-text"></div>
        ) : (
          <pre className="note-text">{topic.content}</pre>
        )}
      </div>
      {topic.examples && (
        <div className="note-examples">
          <motion.h3
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Examples
          </motion.h3>
          {isLoading ? (
            <div className="skeleton skeleton-code"></div>
          ) : (
            <div className="code-block-wrapper">
              <pre className="code-block">{topic.examples}</pre>
              <motion.button
                className="copy-code-button"
                onClick={handleCopyCode}
                title={copied ? "Copied!" : "Copy Code"}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={copied ? { background: "var(--accent-purple)" } : {}}
                transition={{ duration: 0.3 }}
                aria-label={copied ? "Code copied" : "Copy code example"}
              >
                <ClipboardDocumentCheckIcon className="copy-icon" />
                <span>{copied ? "Copied" : "Copy"}</span>
              </motion.button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default NoteViewer;