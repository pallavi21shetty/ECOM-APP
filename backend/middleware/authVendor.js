import express from "express";
import bcrypt from "bcryptjs"; // ✅ use bcryptjs (portable across OS)
import jwt from "jsonwebtoken";
import Vendor from "../models/Vendor.js";

const router = express.Router();

/**
 * @route   POST /api/vendor/login
 * @desc    Authenticate vendor & return JWT
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 🔹 Find vendor
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔹 Compare password
    const isMatch = await bcrypt.compare(password, vendor.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔹 Check if account active
    if (vendor.status !== "active") {
      return res.status(403).json({ message: "Vendor account is not active" });
    }

    // 🔹 Generate token
    const token = jwt.sign(
      { id: vendor._id, role: "vendor", email: vendor.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔹 Respond
    res.json({
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        mobile: vendor.mobile,
        status: vendor.status,
      },
    });
  } catch (err) {
    console.error("Vendor login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
