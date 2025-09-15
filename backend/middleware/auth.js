// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Middleware to authenticate user via JWT
 * Attaches user info to req.user if valid
 */
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Middleware to allow only vendors
 */
export const vendorMiddleware = (req, res, next) => {
  if (req.vendor?.role === "vendor") {
    return next();
  }
  return res.status(403).json({ message: "Access denied, vendor only" });
};

/**
 * Middleware to allow only admins
 */
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Admins only" });
};


/**
 * Utility function to generate JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),  // must be ObjectId string
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};
