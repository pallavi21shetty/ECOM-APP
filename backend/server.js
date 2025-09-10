// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// ---------- Import Routes ----------
import authRoutes from "./routes/authRoutes.js";             // customer auth
import productRoutes from "./routes/productRoutes.js";       // products
import wishlistRoutes from "./routes/wishlist.js";           // wishlist
import cartRoutes from "./routes/cart.js";                   // cart

import vendorAuthRoutes from "./routes/authVendor.js";       // vendor login
import vendorRequestRoutes from "./routes/vendorRequests.js";// vendor signup (request)

import adminAuthRoutes from "./routes/adminAuth.js";         // admin login
import adminVendorRoutes from "./routes/adminVendor.js";     // admin vendor management

dotenv.config();
const app = express();

// ---------- Middleware ----------
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001","http://localhost:3002"], // frontend URLs
    credentials: true,
  })
);
app.use(express.json()); // parse JSON bodies

// ---------- MongoDB Connection ----------
connectDB();

// ---------- Routes ----------
// Customer routes
app.use("/api/auth", authRoutes);             // user authentication
app.use("/api/products", productRoutes);      // products
app.use("/api/wishlist", wishlistRoutes);     // wishlist
app.use("/api/cart", cartRoutes);             // cart

// Vendor routes
app.use("/api/vendor/auth", vendorAuthRoutes);         // vendor login
app.use("/api/vendor-requests", vendorRequestRoutes);  // vendor signup requests

// Admin routes
app.use("/api/admin/auth", adminAuthRoutes);           // admin login
app.use("/api/admin", adminVendorRoutes);              // vendor requests & vendor management

// ---------- Default Route ----------
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ---------- 404 Route ----------
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// ---------- Global Error Handling ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
