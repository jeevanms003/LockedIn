import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TopicList from "@/features/notes/components/TopicList";
import NoteViewer from "@/features/notes/components/NoteViewer";
import SearchBar from "@/components/SearchBar";
import ProgressBar from "@/components/ProgressBar";
import { useProgress } from "@/features/progress/useProgress";
import dsaTopics from "@/features/notes/data/dsaTopics.json";
import adaTopics from "@/features/notes/data/adaTopics.json";
import { MagnifyingGlassIcon, TableCellsIcon } from "@heroicons/react/24/outline";
import "./NotesPage.css";

const NotesPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  const allTopics = [
    { category: "Data Structures", topics: dsaTopics },
    { category: "Algorithm Design", topics: adaTopics },
  ];

  const location = useLocation();
  const initialTopic = location.state?.selectedTopic || allTopics[0].topics[0];
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [searchQuery, setSearchQuery] = useState("");
  const { completedTopics } = useProgress();

  const totalTopics = useMemo(() => {
    return allTopics.reduce((sum, section) => sum + section.topics.length, 0);
  }, []);

  useEffect(() => {
    if (location.state?.selectedTopic) {
      setSelectedTopic(location.state.selectedTopic);
    }
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location.state]);

  const handleSelectTopic = (topic) => {
    setIsLoading(true);
    setSelectedTopic(topic);
    setTimeout(() => setIsLoading(false), 500);
  };

  const filteredTopics = useMemo(() => {
    if (!searchQuery) return allTopics;
    const lowerQuery = searchQuery.toLowerCase();
    return allTopics
      .map((section) => ({
        category: section.category,
        topics: section.topics.filter((topic) =>
          topic.title.toLowerCase().includes(lowerQuery)
        ),
      }))
      .filter((section) => section.topics.length > 0);
  }, [searchQuery]);

  return (
    <motion.div
      className="notes-page"
      data-theme={document.documentElement.getAttribute("data-theme") || "dark"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="floating-icons" aria-hidden="true">
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="4" r="3" />
            <path d="M12 7 L9 10 M12 7 L15 10" />
            <circle cx="9" cy="13" r="3" />
            <circle cx="15" cy="13" r="3" />
          </svg>
        </div>
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="6" width="4" height="12" />
            <rect x="10" y="6" width="4" height="12" />
            <rect x="16" y="6" width="4" height="12" />
          </svg>
        </div>
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <path d="M7 8 L3 12 L7 16 M17 8 L21 12 L17 16" />
          </svg>
        </div>
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="6" cy="12" r="3" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="18" cy="12" r="3" />
            <path d="M9 12 H11 M15 12 H17" />
          </svg>
        </div>
      </div>
      <header className="notes-header" aria-label="Notes header">
        <motion.div
          className="header-left"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="notes-title-wrapper">
            <div className="icon-wrapper">
              <TableCellsIcon className="notes-icon" aria-hidden="true" />
            </div>
            <h1 className="notes-title">Notes</h1>
          </div>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            icon={<MagnifyingGlassIcon className="search-icon" />}
            placeholder="Search DSA topics..."
          />
        </motion.div>
        <motion.div
          className="header-right"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <ProgressBar total={totalTopics} completed={completedTopics.length} />
        </motion.div>
      </header>
      <div className="notes-container">
        <motion.div
          className="topic-list-wrapper"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <AnimatePresence>
            {filteredTopics.length === 0 ? (
              <motion.p
                className="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No results found for "{searchQuery}".
              </motion.p>
            ) : (
              filteredTopics.map((section, index) => (
                <motion.div
                  key={section.category}
                  className="topic-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <h3 className="category-title">{section.category}</h3>
                  <TopicList
                    topics={section.topics}
                    onSelectTopic={handleSelectTopic}
                    selectedTopic={selectedTopic}
                    isLoading={isLoading}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
        <NoteViewer topic={selectedTopic} isLoading={isLoading} />
      </div>
    </motion.div>
  );
};

export default NotesPage;