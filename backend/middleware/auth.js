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

  // ✅ Check for Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Fetch the user from DB to ensure valid ObjectId
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach minimal user info to request
    req.user = {
      id: user._id.toString(), // use this in wishlist routes
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
 * Utility function to generate JWT token
 * Call this after login, OTP verification, or registration
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(), // ✅ include MongoDB _id
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};
