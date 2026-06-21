import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

const TOPICS_STORAGE_KEY = "completedTopics";
const PROBLEMS_STORAGE_KEY = "completedProblems";
const INTERVIEWS_STORAGE_KEY = "completedInterviews";
const SOLUTIONS_STORAGE_KEY = "savedSolutions";

export const useProgress = () => {
  const { isAuthenticated, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [completedTopics, setCompletedTopics] = useState(() => {
    const stored = localStorage.getItem(TOPICS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [completedProblems, setCompletedProblems] = useState(() => {
    const stored = localStorage.getItem(PROBLEMS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [interviews, setInterviews] = useState(() => {
    const stored = localStorage.getItem(INTERVIEWS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [solutions, setSolutions] = useState(() => {
    const stored = localStorage.getItem(SOLUTIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Fetch progress from server if logged in
  const fetchServerProgress = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/progress", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCompletedProblems(data.completedProblems || []);
        setInterviews(data.interviews || []);
        // MongoDB Map is serialized as an object, let's normalize it
        setSolutions(data.solutions || {});
      }
    } catch (err) {
      console.error("Failed to fetch progress from server:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServerProgress();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchServerProgress]);

  // Fallback local storage saving (only for guest mode)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(completedTopics));
    }
  }, [completedTopics, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(PROBLEMS_STORAGE_KEY, JSON.stringify(completedProblems));
    }
  }, [completedProblems, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(INTERVIEWS_STORAGE_KEY, JSON.stringify(interviews));
    }
  }, [interviews, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(SOLUTIONS_STORAGE_KEY, JSON.stringify(solutions));
    }
  }, [solutions, isAuthenticated]);

  const toggleTopicComplete = (id) => {
    setCompletedTopics((prev) => {
      const next = prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id];
      return next;
    });
  };

  const toggleProblemComplete = async (id) => {
    const problemIdStr = String(id);
    if (isAuthenticated && token) {
      try {
        const res = await fetch("/api/progress/toggle-complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ problemId: problemIdStr }),
        });
        if (res.ok) {
          const data = await res.json();
          setCompletedProblems(data.completedProblems || []);
        }
      } catch (err) {
        console.error("Error toggling completion on server:", err);
      }
    } else {
      // Local fallback
      setCompletedProblems((prev) =>
        prev.includes(problemIdStr)
          ? prev.filter((pid) => pid !== problemIdStr)
          : [...prev, problemIdStr]
      );
    }
  };

  const saveCodeSolution = async (problemId, code) => {
    const problemIdStr = String(problemId);
    if (isAuthenticated && token) {
      try {
        const res = await fetch("/api/progress/save-solution", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ problemId: problemIdStr, code }),
        });
        if (res.ok) {
          const data = await res.json();
          setSolutions(data.solutions || {});
        }
      } catch (err) {
        console.error("Error saving solution on server:", err);
      }
    } else {
      // Local fallback
      setSolutions((prev) => ({
        ...prev,
        [problemIdStr]: code,
      }));
    }
  };

  const addLocalInterviewAttempt = (attempt) => {
    if (!isAuthenticated) {
      setInterviews((prev) => [attempt, ...prev]);
    } else {
      fetchServerProgress();
    }
  };

  const resetProgress = () => {
    setCompletedTopics([]);
    setCompletedProblems([]);
    setInterviews([]);
    setSolutions({});
    if (!isAuthenticated) {
      localStorage.removeItem(TOPICS_STORAGE_KEY);
      localStorage.removeItem(PROBLEMS_STORAGE_KEY);
      localStorage.removeItem(INTERVIEWS_STORAGE_KEY);
      localStorage.removeItem(SOLUTIONS_STORAGE_KEY);
    }
  };

  return {
    completedTopics,
    completedProblems,
    interviews,
    solutions,
    isLoading,
    toggleTopicComplete,
    toggleProblemComplete,
    saveCodeSolution,
    addLocalInterviewAttempt,
    refreshProgress: fetchServerProgress,
    resetProgress,
  };
};

export default useProgress;