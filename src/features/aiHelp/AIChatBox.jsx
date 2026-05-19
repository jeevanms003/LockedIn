import { useState, useEffect, useRef } from "react";
import { PaperAirplaneIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import "./AIChatBox.css";

const AIChatBox = ({ initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userMessageSent, setUserMessageSent] = useState(false); // Track user message
  const maxChars = 500;
  const chatHistoryRef = useRef(null); // Ref for chat-history

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const textarea = document.querySelector(".ai-textarea");
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [query]);

  useEffect(() => {
    const chatHistory = chatHistoryRef.current;
    if (!chatHistory) return;

    const isNearBottom =
      chatHistory.scrollHeight - chatHistory.scrollTop - chatHistory.clientHeight < 100;

    // Scroll to bottom only if user just sent a message or is near the bottom
    if (userMessageSent || isNearBottom) {
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
  }, [messages, loading, userMessageSent]);

  const askAI = async () => {
    if (!query.trim()) return;
    const userMessage = { type: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);
    setUserMessageSent(true); // Mark user message sent

    try {
      const result = await fetch("http://localhost:3001/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await result.json();
      const aiMessage = {
        type: "ai",
        text: data.answer || data.response || data.error || "No answer received.",
        isError: !!data.error,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Error: Could not connect to the server.",
          isError: true,
          retry: () => setQuery(userMessage.text),
        },
      ]);
    }
    setLoading(false);
    setUserMessageSent(false); // Reset after AI response
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  return (
    <div className="ai-chat-container">
      <h2 className="ai-chat-title">Ask AlgoStudy AI</h2>
      <div className="chat-controls">
        <button
          className="clear-button"
          onClick={() => setMessages([])}
          disabled={messages.length === 0}
          aria-label="Clear chat history"
        >
          Clear Chat
        </button>
      </div>
      <div className="chat-history" aria-live="polite" ref={chatHistoryRef}>
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`chat-bubble ${msg.type === "user" ? "user-bubble" : "ai-bubble"} ${
                msg.isError ? "error-bubble" : ""
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <ReactMarkdown
                components={{
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className="inline-code">{children}</code>
                    ) : (
                      <pre>
                        <code className="block-code">{children}</code>
                      </pre>
                    ),
                }}
              >
                {msg.text}
              </ReactMarkdown>
              {msg.isError && msg.retry && (
                <button
                  className="retry-button"
                  onClick={msg.retry}
                  aria-label="Retry request"
                >
                  <ArrowPathIcon className="retry-icon" />
                  Retry
                </button>
              )}
            </motion.div>
          ))}
          {loading && (
            <motion.div
              className="skeleton skeleton-bubble"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </div>
      <div className="textarea-wrapper">
        <textarea
          className="ai-textarea"
          rows="1"
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, maxChars))}
          onKeyPress={handleKeyPress}
          placeholder="Ask about algorithms or coding..."
          disabled={loading}
          aria-label="Enter your question"
        />
        <button
          onClick={askAI}
          className="ai-button inline-button"
          disabled={loading || !query.trim()}
          aria-label="Send question"
        >
          {loading ? (
            <span className="spinner" aria-hidden="true"></span>
          ) : (
            <PaperAirplaneIcon className="action-icon" />
          )}
        </button>
        <div className="char-counter" aria-hidden="true">
          {query.length}/{maxChars}
        </div>
      </div>
    </div>
  );
};

export default AIChatBox;