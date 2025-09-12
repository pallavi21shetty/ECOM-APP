// server/controllers/paymentsController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Oders.js"; // adjust path if needed
import dotenv from "dotenv";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper: verify signature for checkout response
function verifySignature(order_id, payment_id, signature) {
  const generated = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${order_id}|${payment_id}`)
    .digest("hex");
  return generated === signature;
}

// Helper: compute webhook signature over raw body
function verifyWebhookSignature(rawBody, signature) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}

export async function createOrder(req, res) {
  try {
    const { amount, currency = "INR", receipt, userId, items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    // Razorpay expects amount in paise (smallest currency unit)
    // Ensure the client already sent paise; if you're passing rupees, multiply here:
    // const amountInPaise = Math.round(amount * 100);
    const amountInPaise = amount;

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1, // auto-capture. use 0 if you want manual capture
    };

    const rOrder = await razorpay.orders.create(options);

    // create local order record (snapshot of items/prices)
    const order = new Order({
      customer: userId || null,
      items: items || [], // send minimal snapshot from client / or build server-side
      totalAmount: amountInPaise,
      paymentStatus: "pending",
      paymentMethod: "razorpay",
      transactionId: null,
      razorpayOrderId: rOrder.id,
      status: "created",
      meta: { receipt: options.receipt },
      vendor: "User",
    });

    await order.save();

    // return both Razorpay order and local order id to client
    return res.json({
      success: true,
      razorpayOrder: rOrder,
      localOrderId: order._id,
      amount: rOrder.amount,
      currency: rOrder.currency,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// Handler for redirect/callback_url from Razorpay (GET)
// Example redirect url configured in front-end: https://your-server.com/api/payments/return
// Razorpay will redirect with query params: razorpay_payment_id, razorpay_order_id, razorpay_signature
export async function handleRedirect(req, res) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, localOrderId } = req.query;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      // missing params
      const frontend = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
      return res.redirect(`${frontend}/orders/${localOrderId || ""}?status=failed&reason=missing_params`);
    }

    const valid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    // Find local order either by localOrderId or razorpayOrderId
    let order = null;
    if (localOrderId) order = await Order.findById(localOrderId);
    if (!order) order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (order) {
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.transactionId = razorpay_payment_id;
      order.paymentStatus = valid ? "paid" : "pending";
      order.status = valid ? "placed" : "cancelled";
      await order.save();
    } else {
      console.warn("Local order not found for redirect:", { razorpay_order_id, localOrderId });
    }

    const frontend = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    const redirectOrderId = order ? order._id : (localOrderId || "");
    const status = valid ? "success" : "failed";

    // Redirect browser to frontend order details page
    return res.redirect(`${frontend}/orders/${redirectOrderId}?status=${status}`);
  } catch (err) {
    console.error("handleRedirect error:", err);
    const frontend = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    return res.redirect(`${frontend}/orders/?status=error`);
  }
}

// POST verify endpoint (used by modal flow when handler receives response)
export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, localOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const valid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    // Update local order
    let order = null;
    if (localOrderId) order = await Order.findById(localOrderId);
    if (!order) order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (order) {
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.transactionId = razorpay_payment_id;
      order.paymentStatus = valid ? "paid" : "pending";
      order.status = valid ? "placed" : "cancelled";
      await order.save();
    }

    return res.json({ success: valid });
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// Webhook: receives raw body. Must be registered in Razorpay dashboard with same secret
export async function webhookHandler(req, res) {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body; // express.raw middleware gives Buffer

    const ok = verifyWebhookSignature(rawBody, signature);
    if (!ok) {
      console.warn("Webhook signature mismatch");
      return res.status(400).json({ ok: false, message: "invalid signature" });
    }

    const event = JSON.parse(rawBody.toString());
    // handle event types
    const { event: eventName, payload } = event;

    if (eventName === "payment.captured" || eventName === "payment.authorized") {
      const paymentEntity = payload.payment.entity;
      const rOrderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // update local order
      const order = await Order.findOne({ razorpayOrderId: rOrderId });
      if (order) {
        order.paymentStatus = "paid";
        order.status = "placed";
        order.transactionId = paymentId;
        order.razorpayPaymentId = paymentId;
        await order.save();
      }
    }

    // respond quickly
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("webhookHandler error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// Fetch order (GET)
export async function getLocalOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean().populate("customer", "name email").populate("items.product", "name");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, order });
  } catch (err) {
    console.error("getLocalOrder error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
