// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    role: { type: String, enum: ["User", "Admin", "Vendor"], default: "User" },
    inviteCode: { type: String, default: null },

    // 🔹 OTP fields
    otp: { type: String },
    otpExpiresAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    blockedUntil: { type: Date }, // block user temporarily after 4 wrong attempts

    // 🔹 Wishlist (array of custom productIds like "W3002")
    wishlist: [
      {
        type: String, // ✅ store your custom productId instead of ObjectId
      },
    ],

    // 🔹 Cart (array of { product, qty }) - still using ObjectId references
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // ✅ keep cart tied to actual Product documents
        },
        qty: { type: Number, default: 1 },
        size: String,
        color:String,
    price: Number,
    mrp: Number,
    discountPercent: Number,
    image: String,
    title: String
      },
    ],
  },
  { timestamps: true }
);

// ✅ Ensure email + mobile are unique
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mobile: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

export default User;
