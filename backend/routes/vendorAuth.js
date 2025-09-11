// backend/routes/vendorAuth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Vendor from "../models/Vendor.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// POST /api/vendor/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, vendor.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    if (vendor.status !== "active") {
      return res.status(403).json({ message: "Vendor account is not active" });
    }

    const token = jwt.sign(
      { id: vendor._id, role: "vendor", email: vendor.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
