import jwt from "jsonwebtoken";
import Vendor from "../models/Vendor.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const vendorAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const vendor = await Vendor.findById(decoded.id);
    if (!vendor) return res.status(401).json({ message: "Vendor not found" });

    req.vendor = {
      id: vendor._id.toString(),
      email: vendor.email,
      role: "vendor",
      name: vendor.name,
    };

    next();
  } catch (err) {
    console.error("Vendor auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
