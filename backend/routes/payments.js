// server/routes/payments.js
import express from "express";
import {
  createOrder,
  handleRedirect,
  verifyPayment,
  webhookHandler,
  getLocalOrder,
} from "../controllers/paymentsController.js";
import expressRaw from "express"; // express for raw middleware

const router = express.Router();

// Normal JSON routes
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/return", handleRedirect);
router.get("/order/:id", getLocalOrder);

// Webhook route: use express.raw middleware to preserve raw bytes
// NOTE: when adding this file to your main server, avoid adding express.json() globally
// before the webhook route for this endpoint (or add raw only on this route as below).
router.post(
  "/webhook",
  express.raw({ type: "*/*" }), // important: preserves raw body for signature verification
  webhookHandler
);

export default router;
