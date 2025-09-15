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

// ✅ Razorpay order creation
export async function createOrder(req, res) {
  try {
    const { amount, currency = "INR", receipt, userId, items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    // Razorpay requires amount in paise
    const amountInPaise = amount;

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1, // auto-capture
    };

    // ✅ Create Razorpay order
    const rOrder = await razorpay.orders.create(options);

    // ✅ Build order items asynchronously (fetch vendor from Product)
    const orderItems = await Promise.all(
      (items || []).map(async (it) => {
        let productDoc = null;
        try {
          productDoc = await Product.findById(it.product).lean();
        } catch (err) {
          console.warn("Product lookup failed:", it.product, err.message);
        }

        return {
          product: it.product,
          vendor: productDoc?.details?.vendor || null, // ✅ vendor from product.details
          title: it.title || productDoc?.title || "Item",
          image: it.image || productDoc?.image || null,
          quantity: it.quantity,
          price: it.price / 100, // store in rupees
          status: "placed",
          history: [{ status: "placed", changedBy: "user" }],
        };
      })
    );

    // ✅ Save local order in DB
    const order = new Order({
      customer: userId || null,
      items: orderItems,
      totalAmount: amountInPaise / 100, // convert paise → rupees
      paymentStatus: "pending",
      paymentMethod: "razorpay",
      transactionId: null,
      razorpayOrderId: rOrder.id,
      orderStatus: "not placed",
      history: [{ status: "created", changedBy: "system" }],
      meta: { receipt: options.receipt },
    });

    await order.save();

    return res.json({
      success: true,
      razorpayOrder: rOrder,
      localOrderId: order._id,
      amount: rOrder.amount, // still in paise for Razorpay checkout
      currency: rOrder.currency,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
}
// ✅ Razorpay redirect/callback
export async function handleRedirect(req, res) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, localOrderId } = req.query;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      const frontend = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
      return res.redirect(
        `${frontend}/orders/${localOrderId || ""}?status=failed&reason=missing_params`
      );
    }

    const valid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    let order = null;
    if (localOrderId) order = await Order.findById(localOrderId);
    if (!order) order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (order) {
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.transactionId = razorpay_payment_id;
      order.paymentStatus = valid ? "paid" : "pending";
      order.orderStatus = valid ? "placed" : "cancelled";
      order.history.push({ status: order.orderStatus, changedBy: "system" });
      await order.save();
    }

    const frontend = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    const redirectOrderId = order ? order._id : localOrderId || "";
    const status = valid ? "success" : "failed";

    return res.redirect(`${frontend}/orders/${redirectOrderId}?status=${status}`);
  } catch (err) {
    console.error("handleRedirect error:", err);
    const frontend = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    return res.redirect(`${frontend}/orders/?status=error`);
  }
}

// ✅ Modal verify endpoint
export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, localOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const valid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    let order = null;
    if (localOrderId) order = await Order.findById(localOrderId);
    if (!order) order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (order) {
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.transactionId = razorpay_payment_id;
      order.paymentStatus = valid ? "paid" : "pending";
      order.orderStatus = valid ? "placed" : "cancelled";
      order.history.push({ status: order.orderStatus, changedBy: "system" });
      await order.save();
    }

    return res.json({ success: valid });
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
}

// ✅ Razorpay Webhook
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
    const { event: eventName, payload } = event;

    if (eventName === "payment.captured" || eventName === "payment.authorized") {
      const paymentEntity = payload.payment.entity;
      const rOrderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const order = await Order.findOne({ razorpayOrderId: rOrderId });
      if (order) {
        order.paymentStatus = "paid";
        order.orderStatus = "placed";
        order.transactionId = paymentId;
        order.razorpayPaymentId = paymentId;
        order.history.push({ status: "placed", changedBy: "system" });
        await order.save();
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("webhookHandler error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

// ✅ Create Local Order (COD / Offline)
export async function createLocalOrder(req, res) {
  try {
    const { cartItems, shippingAddress, paymentMethod = "cod", totalAmount } = req.body;
    const customerId = req.user?._id || null;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const items = cartItems.map((item) => ({
      product: item._id,
      vendor: item.vendor || null, // ✅ vendor id
      quantity: item.quantity,
      price: item.price,
      title: item.title,
      image: item.image,
      status: "placed",
      history: [{ status: "placed", changedBy: "user" }],
    }));

    const order = new Order({
      customer: customerId,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      shippingAddress,
      orderStatus: "placed",
      history: [{ status: "placed", changedBy: "user" }],
    });

    await order.save();

    return res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("createLocalOrder error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// ✅ Fetch single order
export async function getLocalOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .lean()
      .populate("customer", "name email")
      .populate("items.product", "title image price");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, order });
  } catch (err) {
    console.error("getLocalOrder error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
