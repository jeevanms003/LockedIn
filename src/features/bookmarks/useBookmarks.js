import { useState, useEffect } from "react";

const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (topic) => {
    setBookmarks((prev) => {
      if (!prev.some((b) => b.id === topic.id)) {
        console.log(`Adding bookmark: ${topic.title} (${topic.id})`);
        return [...prev, topic];
      }
      console.log(`Bookmark already exists: ${topic.title} (${topic.id})`);
      return prev;
    });
  };

  const removeBookmark = (topicId) => {
    setBookmarks((prev) => {
      const newBookmarks = prev.filter((b) => b.id !== topicId);
      console.log(`Removing bookmark with ID: ${topicId}`);
      console.log(`New bookmarks:`, newBookmarks);
      return newBookmarks;
    });
  };

  const isBookmarked = (topicId) => {
    const bookmarked = bookmarks.some((b) => b.id === topicId);
    console.log(`Checking if bookmarked: ${topicId} -> ${bookmarked}`);
    return bookmarked;
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
};

export default useBookmarks;