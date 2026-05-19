import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  DocumentTextIcon,
  CommandLineIcon,
  PlayCircleIcon,
  BookmarkIcon,
  SparklesIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import "./HomePage.css";

const HomePage = () => {
  const features = [
    {
      title: "Notes",
      description: "Organize your DSA notes efficiently with our intuitive editor.",
      icon: <DocumentTextIcon className="hp-icon" />,
      path: "/notes",
    },
    {
      title: "Practice",
      description: "Solve DSA problems in our built-in coding sandbox and get AI critiques.",
      icon: <CommandLineIcon className="hp-icon" />,
      path: "/practice",
    },
    {
      title: "Mock Interview",
      description: "Practice simulated behavioral and technical interviews with webcam feeds.",
      icon: <ChatBubbleLeftRightIcon className="hp-icon" />,
      path: "/mock-interview",
    },
    {
      title: "Dashboard",
      description: "View progress metrics, saved solutions, and past interview reports.",
      icon: <UserCircleIcon className="hp-icon" />,
      path: "/dashboard",
    },
    {
      title: "Animations",
      description: "Visualize algorithms with interactive animations.",
      icon: <PlayCircleIcon className="hp-icon" />,
      path: "/animations",
    },
    {
      title: "Bookmarks",
      description: "Save important problems and resources for quick access.",
      icon: <BookmarkIcon className="hp-icon" />,
      path: "/bookmarks",
    },
    {
      title: "AI Help",
      description: "Get instant explanations and hints with AI assistance.",
      icon: <SparklesIcon className="hp-icon" />,
      path: "/ai-help",
    },
    {
      title: "Placement Tutor",
      description: "Create a personalized study plan for your target companies.",
      icon: <CalendarIcon className="hp-icon" />,
      path: "/daily-planner",
    },
  ];

  return (
    <motion.div
      className="hp-home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <section className="hp-hero-section" aria-label="Hero section">
        <h1 className="hp-app-name">LockedIn</h1>
        <div className="hp-tagline">
          <p className="hp-tagline-text">Lock In Your Dream Tech Offer with AI Prep</p>
        </div>
      </section>
      <div className="hp-floating-icons" aria-hidden="true">
        <div className="hp-floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <div className="hp-floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="4" r="3" />
            <path d="M12 7 L9 10 M12 7 L15 10" />
            <circle cx="9" cy="13" r="3" />
            <circle cx="15" cy="13" r="3" />
          </svg>
        </div>
        <div className="hp-floating-icon">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="6" width="4" height="12" />
            <rect x="10" y="6" width="4" height="12" />
            <rect x="16" y="6" width="4" height="12" />
          </svg>
        </div>
        <div className="hp-floating-icon">
          <svg viewBox="0 0 24 24">
            <path d="M7 8 L3 12 L7 16 M17 8 L21 12 L17 16" />
          </svg>
        </div>
        <div className="hp-floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="18" r="3" />
            <path d="M6 6 L18 18" />
          </svg>
        </div>
      </div>
      <section className="hp-features-grid" aria-label="Features section">
        <AnimatePresence>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link to={feature.path} className="hp-feature-card" aria-label={`Go to ${feature.title}`}>
                <div className="hp-icon-wrapper">{feature.icon}</div>
                <h2 className="hp-card-title">{feature.title}</h2>
                <p className="hp-card-description">{feature.description}</p>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>
      <footer className="hp-footer" aria-label="Footer">
        <p>LockedIn © {new Date().getFullYear()}</p>
      </footer>
    </motion.div>
  );
};

export default HomePage;