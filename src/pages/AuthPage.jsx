import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/AuthContext";
import { UserIcon, EnvelopeIcon, KeyIcon, SparklesIcon } from "@heroicons/react/24/outline";
import "./AuthPage.css";

const AuthPage = () => {
  const { login, register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when toggling modes
  useEffect(() => {
    clearError();
    setFormError("");
  }, [isLogin, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsLoading(false);

    if (isLogin) {
      if (!email || !password) {
        setFormError("All fields are required");
        return;
      }
      try {
        setIsLoading(true);
        // In our backend login endpoint accepts email Or Username
        await login(email, password);
      } catch (err) {
        // Error is set in AuthContext
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!username || !email || !password) {
        setFormError("All fields are required");
        return;
      }
      if (password.length < 6) {
        setFormError("Password must be at least 6 characters long");
        return;
      }
      try {
        setIsLoading(true);
        await register(username, email, password);
      } catch (err) {
        // Error is set in AuthContext
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-container-wrapper">
      <div className="decor-grid" aria-hidden="true">
        <div className="blur-circle primary"></div>
        <div className="blur-circle secondary"></div>
      </div>

      <motion.div
        className="auth-box-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <div className="auth-brand-logo">
            <SparklesIcon className="logo-spark" />
            <span>LockedIn</span>
          </div>
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p>{isLogin ? "Log in to access your dashboard and cloud sync" : "Register to track DSA and interview progress"}</p>
        </div>

        {(error || formError) && (
          <div className="auth-error-banner">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-fields">
          {!isLogin && (
            <div className="auth-field-group">
              <label>Username</label>
              <div className="input-with-icon">
                <UserIcon className="field-icon" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-field-group">
            <label>{isLogin ? "Username or Email" : "Email Address"}</label>
            <div className="input-with-icon">
              <EnvelopeIcon className="field-icon" />
              <input
                type="text"
                placeholder={isLogin ? "username or email" : "e.g. user@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label>Password</label>
            <div className="input-with-icon">
              <KeyIcon className="field-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="submit-auth-btn">
            {isLoading ? (
              <span className="btn-spinner"></span>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-mode-switch">
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button onClick={() => setIsLogin(!isLogin)} className="switch-toggle-btn">
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
