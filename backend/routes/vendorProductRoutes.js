// backend/routes/vendorProducts.js
import express from "express";
import Product from "../models/Product.js";
import { vendorAuthMiddleware } from "../middleware/authVendor.js"; // use vendor auth

const router = express.Router();

// ✅ Get vendor’s products
router.get("/", vendorAuthMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.vendor.id });
    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add product (pending by default)
router.post("/", vendorAuthMiddleware, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      vendor: req.vendor.id,
      status: "pending",
    });
    const saved = await product.save();
    res.json(saved);
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update vendor’s product
router.put("/id/:id", vendorAuthMiddleware, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor: req.vendor.id }, // only update own products
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete vendor’s product
router.delete("/id/:id", vendorAuthMiddleware, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      vendor: req.vendor.id, // only delete own products
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
