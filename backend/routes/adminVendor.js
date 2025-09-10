// backend/routes/adminVendor.js
import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import VendorRequest from "../models/VendorRequest.js";
import Vendor from "../models/Vendor.js";

const router = express.Router();

// Protect all routes
router.use(authAdmin);

// GET all vendor requests
router.get("/vendor-requests", async (req, res) => {
  try {
    const list = await VendorRequest.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET single vendor request
router.get("/vendor-requests/:id", async (req, res) => {
  try {
    const request = await VendorRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// APPROVE request -> create Vendor
router.post("/vendor-requests/:id/approve", async (req, res) => {
  try {
    const request = await VendorRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    // Check if vendor already exists
    const exists = await Vendor.findOne({ email: request.email });
    if (exists) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    const vendor = await Vendor.create({
      name: request.name,
      age: request.age,
      mobile: request.mobile,
      email: request.email,
      passwordHash: request.passwordHash, // already hashed at registration
      gstin: request.gstin,
      status: "active",
    });

    request.status = "approved";
    await request.save();

    res.json({ ok: true, vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// REJECT request
router.post("/vendor-requests/:id/reject", async (req, res) => {
  try {
    const request = await VendorRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    request.status = "rejected";
    request.rejectionReason = req.body.reason || "Rejected by admin";
    await request.save();

    res.json({ ok: true, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// GET all approved vendors
// ------------------------
router.get("/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
