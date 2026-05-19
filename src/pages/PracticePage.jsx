import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import ProblemCard from "@/components/ProblemCard";
import ProgressBar from "@/components/ProgressBar";
import { useProgress } from "@/features/progress/useProgress";
import problems from "@/features/practice/data/problems.json";
import { MagnifyingGlassIcon, CommandLineIcon } from "@heroicons/react/24/outline";
import "./PracticePage.css";

const PracticePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isLoading, setIsLoading] = useState(true);
  const { completedProblems } = useProgress();

  const categories = useMemo(() => {
    const uniqueTopics = [...new Set(problems.map((p) => p.topic))].sort();
    return ["All Categories", ...uniqueTopics];
  }, []);

  const totalProblems = problems.length;

  const filteredProblems = useMemo(() => {
    let filtered = problems;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.topic.toLowerCase().includes(lowerQuery)
      );
    }
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((p) => p.topic === selectedCategory);
    }
    return filtered;
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  return (
    <motion.div
      className="practice-page"
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
      <header className="practice-header" aria-label="Practice header">
        <motion.div
          className="header-left"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="practice-title-wrapper">
            <CommandLineIcon className="title-icon" aria-hidden="true" />
            <h1 className="practice-title">Practice Problems</h1>
          </div>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            icon={<MagnifyingGlassIcon className="search-icon" />}
            placeholder="Search DSA problems..."
          />
        </motion.div>
        <motion.div
          className="header-right"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <ProgressBar total={totalProblems} completed={completedProblems.length} />
          <select
            className="category-dropdown"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Select problem category"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </motion.div>
      </header>
      <AnimatePresence>
        {filteredProblems.length === 0 ? (
          <motion.p
            className="no-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            No problems found for "
            {searchQuery || selectedCategory !== "All Categories"
              ? `${searchQuery} ${selectedCategory}`
              : "your filters"}
            ".
          </motion.p>
        ) : (
          <motion.ol
            className="problems-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <li key={index} className="skeleton skeleton-card"></li>
                ))
              : filteredProblems.map((problem, index) => (
                  <motion.li
                    key={problem.id}
                    className="problem-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <ProblemCard
                      title={problem.title}
                      description={problem.description}
                      solution={problem.solution}
                      id={problem.id}
                      topic={problem.topic}
                      number={index + 1}
                      difficulty={problem.difficulty}
                      isCompleted={completedProblems.includes(problem.id)}
                      link={problem.link}
                    />
                  </motion.li>
                ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PracticePage;