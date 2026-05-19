import { motion } from "framer-motion";

const TopicList = ({ topics, onSelectTopic, selectedTopic, isLoading }) => {
  return (
    <div className="topic-list">
      {topics.map((topic) => (
        <motion.div
          key={topic.id}
          className="topic-item-container"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`topic-item ${
              selectedTopic?.id === topic.id ? "selected" : ""
            }`}
            onClick={() => !isLoading && onSelectTopic(topic)}
            role="button"
            tabIndex={0}
            aria-label={`Select topic ${topic.title}`}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && onSelectTopic(topic)}
          >
            {topic.title}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TopicList;