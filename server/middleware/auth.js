const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from header
  const authHeader = req.header("Authorization");
  
  if (!authHeader) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  // Expect Format: Bearer <token>
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Token format is invalid" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "lockedin_jwt_secret_key_12345");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = authMiddleware;
