import { useRef } from "react";
import { motion } from "framer-motion";

const SearchBar = ({ value, onChange, icon, placeholder = "Search..." }) => {
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange("");
    inputRef.current.focus();
  };

  return (
    <motion.div
      className="search-bar"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      {icon && (
        <motion.span
          className="search-icon-wrapper"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.span>
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        aria-label="Search problems"
      />
      {value && (
        <motion.button
          className="search-clear"
          onClick={handleClear}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Clear search"
        >
          ✕
        </motion.button>
      )}
    </motion.div>
  );
};

export default SearchBar;