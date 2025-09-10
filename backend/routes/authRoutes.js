import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // put in .env for production
const router = express.Router();

// Utility → generate random 6 digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Validation helpers
const validateMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);
const validateEmail = (email) =>
  /^[a-z]{1,15}[0-9]{0,3}[._%+-]*@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);
const validateName = (name) => /^[A-Za-z\s]+$/.test(name); // only alphabets & spaces

// Step 1: Check mobile
router.post("/check-user", async (req, res) => {
  const { mobile } = req.body;

  if (!validateMobile(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Invalid mobile: must be 10 digits and start with 9,8,7,6",
    });
  }

  const user = await User.findOne({ mobile });

  if (user) {
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 1 * 60 * 1000; // 1 minute
    user.otpAttempts = 0;
    await user.save();

    return res.json({
      success: true,
      status: "existing",
      message: "OTP generated for login",
      otp, // 🔹 dev only
    });
  } else {
    return res.json({
      success: true,
      status: "new",
      message: "Mobile not found, proceed signup",
    });
  }
});

// Step 2: Signup new user & send OTP
router.post("/signup", async (req, res) => {
  const { mobile, name, email, gender, role,  inviteCode } = req.body;

  
  // ✅ Check missing fields first
  if (!mobile) {
    return res.status(400).json({ success: false, message: "Mobile field is missing" });
  }
  if (!name) {
    return res.status(400).json({ success: false, message: "Name field is missing" });
  }
  if (!email) {
    return res.status(400).json({ success: false, message: "Email field is missing" });
  }
  if (!gender) {
    return res.status(400).json({ success: false, message: "Gender field is missing" });
  }
  if (!role) {
    return res.status(400).json({ success: false, message: "Role field is missing" });
  }


  // ✅ Validate inputs
  if (!validateMobile(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Invalid mobile: must be 10 digits and start with 9,8,7,6",
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid email: must start with lowercase letters (max 15) and up to 3 digits allowed before domain",
    });
  }

  
  // ✅ Validate Name
if (!validateName(name)) {
  return res.status(400).json({
    success: false,
    message: "Invalid name: only alphabets and spaces are allowed",
  });
}

  // ✅ Validate Gender
  if (!gender || !["Male", "Female"].includes(gender)) {
    return res.status(400).json({
      success: false,
      message: "Gender is required and must be Male or Female",
    });
  }

  // ✅ Validate Role
  if (!role || !["User", "Admin", "Vendor"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role is required and must be User, Admin, or Vendor",
    });
  }

  const existing = await User.findOne({ mobile });
  if (existing)
    return res.status(400).json({ success: false, message: "User already exists" });

  const otp = generateOtp();

  const user = new User({
    mobile,
    name,
    email,
    gender,
    role: role || "User",
     inviteCode: inviteCode || null, // 🔹 optional
    otp,
    otpExpiresAt: Date.now() + 1 * 60 * 1000,
    otpAttempts: 0,
  });
  await user.save();

  res.json({
    success: true,
    status: "otp_sent",
    message: "OTP generated for signup",
    otp, // 🔹 dev only
  });
});

// Step 3: Verify OTP (unchanged)
router.post("/verify-otp", async (req, res) => {
  const { mobile, otp } = req.body;
  const user = await User.findOne({ mobile });
  if (!user) return res.status(400).json({ success: false, message: "User not found" });

  if (user.blockedUntil && user.blockedUntil > Date.now()) {
    return res.status(400).json({
      success: false,
      message: "Too many failed attempts. Try again later.",
      blockedUntil: user.blockedUntil,
    });
  }

  if (!user.otp || user.otpExpiresAt < Date.now()) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  // ✅ Correct OTP
  if (user.otp === otp) {
    user.otp = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    // 🔑 Generate JWT token
    const token = jwt.sign(
      { id: user._id, mobile: user.mobile, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

  //console.log("Generated JWT:", token); 

    return res.json({
      success: true,
      message: "Successfully verified & logged in",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        gender: user.gender,
      },
    });
  }

  // ❌ Wrong OTP
  user.otpAttempts += 1;
  if (user.otpAttempts >= 4) {
    user.blockedUntil = Date.now() + 3000; // 3 sec block
    await user.save();
    return res.status(400).json({
      success: false,
      message: "Too many invalid attempts. Blocked for 3s",
      blockedUntil: user.blockedUntil,
    });
  }

  await user.save();
  return res.status(400).json({
    success: false,
    message: `Invalid OTP. Attempts left: ${4 - user.otpAttempts}`,
  });
});
// Step 4: Resend OTP (unchanged)
router.post("/send-otp", async (req, res) => {
  const { mobile } = req.body;

  if (!validateMobile(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Invalid mobile: must be 10 digits and start with 9,8,7,6",
    });
  }

  const user = await User.findOne({ mobile });
  if (!user) return res.status(400).json({ success: false, message: "User not found" });

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiresAt = Date.now() + 1 * 60 * 1000;
  user.otpAttempts = 0;
  await user.save();

  res.json({
    success: true,
    message: "OTP resent successfully",
    otp, // 🔹 dev only
  });
});




router.get("/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-otp -otpExpiresAt -otpAttempts");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user });
});


export default router;
