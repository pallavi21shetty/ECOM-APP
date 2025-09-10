import jwt from "jsonwebtoken";

export default function authAdmin(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing authorization header" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = decoded; // attach full decoded token
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
