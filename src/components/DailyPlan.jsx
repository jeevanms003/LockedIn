import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, ArrowUturnLeftIcon, PlayCircleIcon, LinkIcon } from "@heroicons/react/24/solid";
import "./DailyPlan.css";

const DailyPlan = ({ plan, onMarkDone }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [toast, setToast] = useState(null);

  // Group tasks by date for calendar view
  const tasksByDate = plan.reduce((acc, task, index) => {
    const date = new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push({ ...task, originalIndex: index });
    return acc;
  }, {});

  // Generate a 30-day calendar
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split("T")[0];
    return {
      date: dateString,
      day: date.getDate(),
      isToday: date.toDateString() === new Date().toDateString(),
      tasks: tasksByDate[dateString] || [],
    };
  });

  // Handle marking tasks as done or undone
  const handleMarkDone = (index, completed) => {
    console.log(`Mark as Done/Undo clicked for task index: ${index}, setting completed to: ${!completed}`);
    onMarkDone(index, !completed);
    setToast({
      message: completed ? "Task unmarked!" : "Task marked as done!",
      type: completed ? "undo" : "done",
    });
    setTimeout(() => setToast(null), 4000);
  };

  // Open external links
  const openLink = (url) => {
    window.open(url, "_blank");
  };

  return (
    <motion.div
      className="dp-plan-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {toast && (
        <motion.div
          className={`dp-toast dp-toast-${toast.type}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <span className="dp-toast-icon">
            {toast.type === "done" ? (
              <CheckCircleIcon />
            ) : (
              <ArrowUturnLeftIcon />
            )}
          </span>
          {toast.message}
        </motion.div>
      )}
      <h2 className="dp-plan-title">Your Study Plan</h2>
      {plan.length === 0 ? (
        <p className="dp-info-text">No plan selected. Create or load a plan!</p>
      ) : (
        <>
          <h3 className="dp-section-heading">Calendar View</h3>
          <div className="dp-calendar-grid">
            {calendarDays.map((day) => (
              <motion.div
                key={day.date}
                className={`dp-calendar-day ${day.isToday ? "dp-today" : ""} ${
                  day.tasks.length > 0 ? "dp-has-tasks" : ""
                }`}
                onClick={() => {
                  console.log("Selected date:", day.date);
                  setSelectedDate(day.date);
                }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <span className="dp-day-number">{day.day}</span>
                {day.tasks.length > 0 && (
                  <div className="dp-task-preview">
                    <span className="dp-task-count">{day.tasks.length}</span>
                    <div className="dp-task-preview-list">
                      {day.tasks.slice(0, 2).map((task, idx) => (
                        <span key={idx} className="dp-task-preview-item">
                          {task.skill}
                        </span>
                      ))}
                      {day.tasks.length > 2 && <span className="dp-task-preview-more">...</span>}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {selectedDate && (
              <motion.div
                className="dp-task-list"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="dp-section-heading">Tasks for {selectedDate}</h4>
                {tasksByDate[selectedDate]?.length > 0 ? (
                  <ul className="dp-task-items">
                    {tasksByDate[selectedDate].map((task, idx) => (
                      <motion.li
                        key={idx}
                        className="dp-task-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.02, rotate: 1 }}
                      >
                        <div className="dp-task-header">
                          <strong>{task.skill}</strong>
                          {task.isCustom && <em className="dp-custom-tag">Custom</em>}
                          {task.company && <em className="dp-company-tag">{task.company}</em>}
                        </div>
                        <div className="dp-task-details">
                          <p>
                            <span>({task.hours} hrs)</span> | Topics:{" "}
                            {task.topics.map((topic, i) => (
                              <span key={i}>
                                {typeof topic === "string" ? topic : topic.name}
                                <motion.button
                                  className="dp-video-button"
                                  onClick={() => {
                                    console.log("Opening YouTube search for topic:", topic.name || topic);
                                    openLink(`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.name || topic)}`);
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <PlayCircleIcon className="dp-video-icon" />
                                </motion.button>
                                {i < task.topics.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </p>
                          <p>
                            Solve: {task.questions} Question{task.questions > 1 ? "s" : ""} ({task.difficulty})
                            {task.questionTitles?.length > 0 && (
                              <span>
                                {" ("}
                                {task.questionTitles.map((q, i) => (
                                  <span key={i}>
                                    {typeof q === "string" ? q : q.title || q.name}
                                    <motion.button
                                      className="dp-video-button"
                                      onClick={() => {
                                        console.log("Opening YouTube search for question:", q.title || q.name);
                                        openLink(`https://www.youtube.com/results?search_query=${encodeURIComponent(q.title || q.name)}`);
                                      }}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <PlayCircleIcon className="dp-video-icon" />
                                    </motion.button>
                                    {q.problemLink && (
                                      <motion.button
                                        className="dp-link-button"
                                        onClick={() => {
                                          console.log("Opening problem link for:", q.title || q.name);
                                          openLink(q.problemLink);
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <LinkIcon className="dp-link-icon" />
                                      </motion.button>
                                    )}
                                    {i < task.questionTitles.length - 1 ? ", " : ""}
                                  </span>
                                ))}
                                {")"}
                              </span>
                            )}
                          </p>
                        </div>
                        <motion.button
                          className={`dp-task-button ${task.completed ? "dp-completed" : ""}`}
                          onClick={() => handleMarkDone(task.originalIndex, task.completed)}
                          whileHover={{ scale: 1.05, rotate: 2 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          {task.completed ? (
                            <>
                              <ArrowUturnLeftIcon className="dp-button-icon" />
                              Undo
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="dp-button-icon" />
                              Mark as Done
                            </>
                          )}
                        </motion.button>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="dp-info-text">No tasks for this date.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <h3 className="dp-section-heading">List View</h3>
          <ul className="dp-task-items">
            <AnimatePresence>
              {plan.map((task, index) => (
                <motion.li
                  key={index}
                  className="dp-task-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02, rotate: 1 }}
                >
                  <div className="dp-task-header">
                    <strong>Day {index + 1}:</strong> {task.skill}
                    {task.isCustom && <em className="dp-custom-tag">Custom</em>}
                    {task.company && <em className="dp-company-tag">{task.company}</em>}
                  </div>
                  <div className="dp-task-details">
                    <p>
                      <span>({task.hours} hrs)</span> | Topics:{" "}
                      {task.topics.map((topic, i) => (
                        <span key={i}>
                          {typeof topic === "string" ? topic : topic.name}
                          <motion.button
                            className="dp-video-button"
                            onClick={() => {
                              console.log("Opening YouTube search for topic:", topic.name || topic);
                              openLink(`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.name || topic)}`);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <PlayCircleIcon className="dp-video-icon" />
                          </motion.button>
                          {i < task.topics.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                    <p>
                      Solve: {task.questions} Question{task.questions > 1 ? "s" : ""} ({task.difficulty})
                      {task.questionTitles?.length > 0 && (
                        <span>
                          {" ("}
                          {task.questionTitles.map((q, i) => (
                            <span key={i}>
                              {typeof q === "string" ? q : q.title || q.name}
                              <motion.button
                                className="dp-video-button"
                                onClick={() => {
                                  console.log("Opening YouTube search for question:", q.title || q.name);
                                  openLink(`https://www.youtube.com/results?search_query=${encodeURIComponent(q.title || q.name)}`);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <PlayCircleIcon className="dp-video-icon" />
                              </motion.button>
                              {q.problemLink && (
                                <motion.button
                                  className="dp-link-button"
                                  onClick={() => {
                                    console.log("Opening problem link for:", q.title || q.name);
                                    openLink(q.problemLink);
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <LinkIcon className="dp-link-icon" />
                                </motion.button>
                              )}
                              {i < task.questionTitles.length - 1 ? ", " : ""}
                            </span>
                          ))}
                          {")"}
                        </span>
                      )}
                    </p>
                  </div>
                  <motion.button
                    className={`dp-task-button ${task.completed ? "dp-completed" : ""}`}
                    onClick={() => handleMarkDone(index, task.completed)}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {task.completed ? (
                      <>
                        <ArrowUturnLeftIcon className="dp-button-icon" />
                        Undo
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="dp-button-icon" />
                        Mark as Done
                      </>
                    )}
                  </motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </motion.div>
  );
};

export default DailyPlan;