import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// ---------- Import Routes ----------
import authRoutes from "./routes/authRoutes.js";             // customer auth
import productRoutes from "./routes/productRoutes.js";       // products (customer)
import wishlistRoutes from "./routes/wishlist.js";           // wishlist
import cartRoutes from "./routes/cart.js";                   // cart
import orderRoutes from "./routes/orderRoutes.js";

import vendorAuthRoutes from "./routes/vendorAuth.js";       // vendor login
import vendorRequestRoutes from "./routes/vendorRequests.js";// vendor signup (request)
import vendorProductRoutes from "./routes/vendorProductRoutes.js"; // vendor products

import adminAuthRoutes from "./routes/adminAuth.js";         // admin login
import adminVendorRoutes from "./routes/adminVendor.js";     // admin vendor management
import adminProductRoutes from "./routes/adminProductRoutes.js";  // admin products
import paymentsRoutes from "./routes/payments.js";         // payments

import userRoutes from "./routes/userRoutes.js";



dotenv.config();
const app = express();

// ---------- Middleware ----------
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true,
  })
);
app.use(express.json()); // parse JSON bodies

// ---------- MongoDB Connection ----------
connectDB();

// ---------- Routes ----------
// Customer routes
app.use("/api/auth", authRoutes);             // user authentication
app.use("/api/products", productRoutes);      // customer products
app.use("/api/wishlist", wishlistRoutes);     // wishlist
app.use("/api/cart", cartRoutes);             // cart
app.use("/api/orders", orderRoutes);

// Vendor routes
app.use("/api/vendor/auth", vendorAuthRoutes);          // vendor login
app.use("/api/vendor-requests", vendorRequestRoutes);  // vendor signup requests
app.use("/api/vendor/products", vendorProductRoutes);  // vendor products management

// Admin routes
app.use("/api/admin/auth", adminAuthRoutes);           // admin login
app.use("/api/admin/products", adminProductRoutes);    // admin products management
app.use("/api/admin", adminVendorRoutes);       
app.use("/api/payments", paymentsRoutes);       // payment routes

app.use("/api/users", userRoutes);

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
