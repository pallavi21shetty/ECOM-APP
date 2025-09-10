// backend/routes/vendorRequests.js
import express from "express";
import bcrypt from "bcryptjs";
import VendorRequest from "../models/VendorRequest.js";
import Vendor from "../models/Vendor.js";

const router = express.Router();

// POST /api/vendor-requests
// Public route: Vendor signup request
router.post("/", async (req, res) => {
  try {
    const { name, shopName, age, mobile, email, password, gstin } = req.body;

    // Validate required fields
    if (!name || !shopName || !age || !mobile || !email || !password) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Check if email already exists in VendorRequest or Vendor
    const existsInRequest = await VendorRequest.findOne({ email });
    const existsInVendor = await Vendor.findOne({ email });
    if (existsInRequest || existsInVendor) {
      return res.status(400).json({ message: "Email already used" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create vendor request
    const request = await VendorRequest.create({
      name,
      shopName,
      age,
      mobile,
      email,
      passwordHash,
      gstin,
    });

    res.status(201).json({
      ok: true,
      message: "Request submitted successfully. Awaiting admin approval.",
      requestId: request._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
