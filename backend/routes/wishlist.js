// routes/wishlist.js
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * ➕ Add product to wishlist
 */
router.post("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    // ✅ Find product by MongoDB _id or custom productId
    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId).lean();
    }
    if (!product) {
      product = await Product.findOne({ productId }).lean();
    }
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    // ✅ Add to user's wishlist (avoid duplicates)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: product._id } },
      { new: true }
    ).select("wishlist").lean();

    if (!updatedUser)
      return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Fetch full wishlist products
    const wishlistProducts = await Product.find({
      _id: { $in: updatedUser.wishlist.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();

    res.json({
      success: true,
      message: "Product added to wishlist",
      wishlist: wishlistProducts,
    });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ➖ Remove product from wishlist
 */
router.delete("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    // ✅ Pull the product ID from wishlist
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: new mongoose.Types.ObjectId(productId) } },
      { new: true }
    ).select("wishlist").lean();

    if (!updatedUser)
      return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Fetch full wishlist products
    const wishlistProducts = await Product.find({
      _id: { $in: updatedUser.wishlist.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();

    res.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: wishlistProducts,
    });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * 📥 Get wishlist
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(userId).select("wishlist").lean();
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const wishlistProducts = await Product.find({
      _id: { $in: user.wishlist.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();

    res.json({ success: true, wishlist: wishlistProducts });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
