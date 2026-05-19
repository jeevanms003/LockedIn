import React from 'react';
import './BookmarkButton.css';

const BookmarkButton = ({ topic, isBookmarked, onToggleBookmark }) => {
  return (
    <button
      className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
      onClick={() => onToggleBookmark(topic)}
      title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
    >
      <svg
        className="bookmark-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
};

export default BookmarkButton;