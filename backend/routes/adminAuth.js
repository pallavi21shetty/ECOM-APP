// backend/routes/adminAuth.js
import express from "express";
import jwt from "jsonwebtoken";
import authAdmin from "../middleware/authAdmin.js";
import VendorRequest from "../models/VendorRequest.js";

const router = express.Router();

// ✅ Load admin credentials from .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ------------------------
// PUBLIC ROUTE: Admin login
// ------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return res.status(500).json({
        message: "Admin credentials not configured in .env",
      });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Sign JWT for admin (id = "admin")
    const token = jwt.sign(
      { id: "admin", email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, admin: { email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// PROTECTED ROUTES (Admin Only)
// ------------------------

// Get all vendor requests
router.get("/vendor-requests", authAdmin, async (req, res) => {
  try {
    const requests = await VendorRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve a vendor request
router.post("/vendor-requests/:id/approve", authAdmin, async (req, res) => {
  try {
    const request = await VendorRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "pending")
      return res.status(400).json({ message: "Already processed" });

    request.status = "approved";
    await request.save();

    res.json({ ok: true, message: "Vendor request approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject a vendor request
router.post("/vendor-requests/:id/reject", authAdmin, async (req, res) => {
  try {
    const request = await VendorRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "pending")
      return res.status(400).json({ message: "Already processed" });

    request.status = "rejected";
    request.rejectionReason = req.body.reason || "Rejected by admin";
    await request.save();

    res.json({ ok: true, message: "Vendor request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
