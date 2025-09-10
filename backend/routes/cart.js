import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// 📥 Get cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(userId).populate("cart.product").lean();
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, cart: user.cart });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ➕ Add or increment product in cart
router.post("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { qty = 1, size, color } = req.body;
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    // Find product
    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }
    if (!product) {
      product = await Product.findOne({ productId });
    }
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    const user = await User.findById(userId);

    // Find existing item (same product + size + color)
    const existingIndex = user.cart.findIndex(
      (c) =>
        c.product.toString() === product._id.toString() &&
        c.size === size &&
        c.color === color
    );

    if (existingIndex > -1) {
      user.cart[existingIndex].qty += qty;
    } else {
      user.cart.push({
        product: product._id,
        qty,
        size,
        color,
        price: product.price,
        mrp: product.mrp,
        discountPercent: product.discountPercent,
        image: product.image,
        title: product.title,
      });
    }

    await user.save();

    const populatedUser = await User.findById(userId).populate("cart.product").lean();
    res.json({ success: true, message: "Added to cart", cart: populatedUser.cart });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔄 Update quantity of a cart item
router.put("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { qty, size, color } = req.body;
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(userId);
    const itemIndex = user.cart.findIndex(
      (c) =>
        c.product.toString() === productId &&
        c.size === size &&
        c.color === color
    );

    if (itemIndex === -1)
      return res.status(404).json({ success: false, message: "Cart item not found" });

    user.cart[itemIndex].qty = qty;
    await user.save();

    const populatedUser = await User.findById(userId).populate("cart.product").lean();
    res.json({ success: true, message: "Cart updated", cart: populatedUser.cart });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ➖ Remove product from cart
router.delete("/:productId", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, color } = req.body;
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(userId);
    user.cart = user.cart.filter(
      (c) =>
        !(
          c.product.toString() === productId &&
          c.size === size &&
          c.color === color
        )
    );

    await user.save();

    const populatedUser = await User.findById(userId).populate("cart.product").lean();
    res.json({ success: true, message: "Removed from cart", cart: populatedUser.cart });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
