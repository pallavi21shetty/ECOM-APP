// routes/userRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Get logged-in user's profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true } // 👈 return updated user
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user); // 👈 frontend expects direct user object
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
