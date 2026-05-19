import { BrowserRouter as Router, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";
import "./App.css";
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
  CommandLineIcon,
  PlayCircleIcon,
  BookmarkIcon,
  SparklesIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

// Theme Toggle Component
const ThemeToggle = ({ theme, toggleTheme }) => (
  <motion.div className="theme-toggle" whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} theme`}
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} theme`}
    >
      <AnimatePresence mode="wait">
        {theme === "dark" ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <SunIcon className="theme-icon" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <MoonIcon className="theme-icon" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  </motion.div>
);

// Desktop Navigation Component
const DesktopNav = () => {
  const { isAuthenticated, user, logout } = useAuth();
  
  return (
    <div className="navbar-container">
      <Link to="/daily-planner" className="nav-link">
        <CalendarIcon className="nav-icon" aria-hidden="true" />
        Placement Tutor
      </Link>
      <Link to="/practice" className="nav-link">
        <CommandLineIcon className="nav-icon" aria-hidden="true" />
        Practice
      </Link>
      <Link to="/mock-interview" className="nav-link">
        <ChatBubbleLeftRightIcon className="nav-icon" aria-hidden="true" />
        Mock Interview
      </Link>
      <Link to="/notes" className="nav-link">
        <DocumentTextIcon className="nav-icon" aria-hidden="true" />
        Notes
      </Link>
      <Link to="/animations" className="nav-link">
        <PlayCircleIcon className="nav-icon" aria-hidden="true" />
        Animations
      </Link>
      {isAuthenticated ? (
        <>
          <Link to="/dashboard" className="nav-link profile-link-nav">
            <UserCircleIcon className="nav-icon" aria-hidden="true" />
            Dashboard ({user?.username})
          </Link>
          <button onClick={logout} className="nav-link logout-btn-nav" title="Sign Out">
            <ArrowRightOnRectangleIcon className="nav-icon" aria-hidden="true" />
            Logout
          </button>
        </>
      ) : (
        <Link to="/auth" className="nav-link auth-link-nav">
          <UserCircleIcon className="nav-icon" aria-hidden="true" />
          Sign In
        </Link>
      )}
    </div>
  );
};

// Mobile Navigation Component
const MobileNav = ({ isMenuOpen, closeMenu }) => {
  const { isAuthenticated, user, logout } = useAuth();
  
  const navItems = [
    { to: "/daily-planner", label: "Placement Tutor", icon: CalendarIcon, index: 1 },
    { to: "/practice", label: "Practice", icon: CommandLineIcon, index: 2 },
    { to: "/mock-interview", label: "Mock Interview", icon: ChatBubbleLeftRightIcon, index: 3 },
    { to: "/notes", label: "Notes", icon: DocumentTextIcon, index: 4 },
    { to: "/animations", label: "Animations", icon: PlayCircleIcon, index: 5 },
  ];

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          <motion.div
            className="mobile-menu-overlay open"
            onClick={closeMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-hidden={!isMenuOpen}
          />
          <motion.div
            className="mobile-menu open"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            role="dialog"
            aria-label="Mobile navigation menu"
            aria-hidden={!isMenuOpen}
          >
            <button
              className="hamburger close-btn"
              onClick={closeMenu}
              aria-label="Close menu"
              style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}
            >
              <XMarkIcon className="hamburger-icon" />
            </button>
            <div className="mobile-nav-links">
              {navItems.map((item) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: item.index * 0.05, duration: 0.2 }}
                  style={{ "--index": item.index }}
                >
                  <Link to={item.to} className="nav-link" onClick={closeMenu}>
                    <item.icon className="nav-icon" aria-hidden="true" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <hr className="mobile-nav-divider" />

              {isAuthenticated ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.2 }}
                  >
                    <Link to="/dashboard" className="nav-link profile-link-nav" onClick={closeMenu}>
                      <UserCircleIcon className="nav-icon" aria-hidden="true" />
                      Dashboard ({user?.username})
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35, duration: 0.2 }}
                  >
                    <button
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="nav-link logout-btn-nav"
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none" }}
                    >
                      <ArrowRightOnRectangleIcon className="nav-icon" aria-hidden="true" />
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                >
                  <Link to="/auth" className="nav-link auth-link-nav" onClick={closeMenu}>
                    <UserCircleIcon className="nav-icon" aria-hidden="true" />
                    Sign In
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Logo Component
const Logo = () => (
  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
    <Link to="/" className="nav-link logo">
      LockedIn
    </Link>
  </motion.div>
);

// Navbar Component
const Navbar = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    localStorage.setItem("theme", initialTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (isMenuOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        if (e.key === "Escape") {
          closeMenu();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      firstElement.focus();

      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isMenuOpen]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <nav className="navbar" aria-label="Main navigation" role="navigation">
      <Logo />
      <div className="navbar-right">
        <DesktopNav />
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <button
          className="hamburger"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <XMarkIcon className="hamburger-icon" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Bars3Icon className="hamburger-icon" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
      <div ref={menuRef}>
        <MobileNav isMenuOpen={isMenuOpen} closeMenu={closeMenu} />
      </div>
    </nav>
  );
};

// App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <motion.div
          className="app-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Navbar />
          <main className="main-content">
            <AppRoutes />
          </main>
        </motion.div>
      </Router>
    </AuthProvider>
  );
}

export default App;