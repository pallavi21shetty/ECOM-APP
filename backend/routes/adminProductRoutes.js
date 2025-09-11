import express from "express";
import Product from "../models/Product.js";
import authAdmin from "../middleware/authAdmin.js"; // <- Use admin JWT middleware

const router = express.Router();

// GET all products (admin)
router.get("/", authAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Update product
router.put("/:id", authAdmin, async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

// Delete product
router.delete("/:id", authAdmin, async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
});

// Approve/Reject product
router.put("/status/:id", authAdmin, async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!product) return res.status(404).json({ message: "Not found" });
  res.json(product);
});

// Test route without auth
router.get("/test", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

export default router;
