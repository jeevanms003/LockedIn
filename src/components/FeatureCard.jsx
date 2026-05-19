import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./FeatureCard.css";

const FeatureCard = ({ title, description, to, icon: Icon }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Link
        to={to}
        className="fc-feature-card"
        aria-label={`Navigate to ${title} section`}
        role="article"
      >
        <motion.div
          className="fc-icon-wrapper"
          whileHover={{ scale: 1.2, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="fc-icon" aria-hidden="true" />
        </motion.div>
        <h3 className="fc-card-title">{title}</h3>
        <p className="fc-card-description">{description}</p>
      </Link>
    </motion.div>
  );
};

export default FeatureCard;