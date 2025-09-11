import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export default function authAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.id !== "admin") return res.status(403).json({ message: "Forbidden" });
    req.user = { id: "admin", email: decoded.email };
    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
