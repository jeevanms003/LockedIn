import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useBookmarks from "../features/bookmarks/useBookmarks";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import "./BookmarksPage.css";

const BookmarksPage = () => {
  const { bookmarks } = useBookmarks();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  console.log("Bookmarks in BookmarksPage:", bookmarks);

  const handleTopicClick = (topic) => {
    navigate("/notes", { state: { selectedTopic: topic } });
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="bp-bookmarks-page"
      data-theme={document.documentElement.getAttribute("data-theme") || "dark"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="bp-bookmarks-header">
        <div className="bp-header-left">
          <div className="bp-bookmarks-title-wrapper">
            <BookmarkIcon className="bp-title-icon" />
            <h1 className="bp-bookmarks-title">Bookmarks</h1>
          </div>
        </div>
        <div className="bp-header-right">
          {/* Theme toggle removed */}
        </div>
      </header>
      <div className="bp-floating-icons" aria-hidden="true">
        {/* Node Icon */}
        <div className="bp-floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        {/* Binary Tree Icon */}
        <div className="bp-floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="4" r="3" />
            <path d="M12 7 L9 10 M12 7 L15 10" />
            <circle cx="9" cy="13" r="3" />
            <circle cx="15" cy="13" r="3" />
          </svg>
        </div>
        {/* Array Icon */}
        <div className="bp-floating-icon">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="6" width="4" height="12" />
            <rect x="10" y="6" width="4" height="12" />
            <rect x="16" y="6" width="4" height="12" />
          </svg>
        </div>
        {/* Code Brackets Icon */}
        <div className="bp-floating-icon">
          <svg viewBox="0 0 24 24">
            <path d="M7 8 L3 12 L7 16 M17 8 L21 12 L17 16" />
          </svg>
        </div>
        {/* Graph Edge Icon */}
        <div className="bp-floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="18" r="3" />
            <path d="M6 6 L18 18" />
          </svg>
        </div>
      </div>
      {bookmarks.length === 0 && !isLoading ? (
        <p className="bp-no-bookmarks">No bookmarked topics yet.</p>
      ) : (
        <ul className="bp-bookmarks-list">
          <AnimatePresence>
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <motion.li
                    key={index}
                    className="bp-skeleton bp-skeleton-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                ))
              : bookmarks.map((topic) => (
                  <motion.li
                    key={topic.id}
                    className="bp-bookmark-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="bp-bookmark-card"
                      onClick={() => handleTopicClick(topic)}
                    >
                      <h3 className="bp-bookmark-title">{topic.title}</h3>
                    </div>
                  </motion.li>
                ))}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  );
};

export default BookmarksPage;