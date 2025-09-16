import express from "express";
import Order from "../models/Oders.js";
import Product from "../models/Product.js"; 
import authAdmin from "../middleware/authAdmin.js"; 
import { authMiddleware } from "../middleware/auth.js";
import { vendorAuthMiddleware } from "../middleware/authVendor.js";

const router = express.Router();

// 🟢 Place a new order with correct price and snapshots
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    let totalAmount = 0;

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error("Product not found");

        const priceInRupees = product.price;
        totalAmount += priceInRupees * item.quantity;

        return {
          product: product._id,
          vendor: product.vendor || null,
          quantity: item.quantity,
          price: priceInRupees,
          title: product.title,
          image: product.image,
          status: "placed",
          history: [{ status: "placed", changedBy: "user" }],
        };
      })
    );

    const order = new Order({
      customer: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      orderStatus: "placed",
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Order placement failed" });
  }
});


// 🟢 Get logged-in user's placed & paid orders
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user.id,
      paymentStatus: "paid"        // ✅ Only paid orders
    })
      .populate("items.product", "title price image")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 Get single order by id (for tracking)
router.get("/track/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.id,
    }).populate("items.product", "title image price");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const itemsWithStatus = order.items.map((item) => ({
      _id: item._id,
      title: item.title || item.product?.title,
      image: item.image || item.product?.image,
      quantity: item.quantity,
      price: item.price,
      status: item.status || "placed",
      history: item.history || [],
    }));

    res.json({ ...order.toObject(), items: itemsWithStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Cancel item (allowed in placed or processing state)
router.put("/cancel/:orderId/:itemId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    const item = order.items.id(req.params.itemId);

    if (!item) return res.status(404).json({ message: "Item not found" });
    if (!["placed", "processing"].includes(item.status)) {
      return res.status(400).json({ message: "Cannot cancel this item now" });
    }

    item.status = "cancelled";
    item.history.push({
      status: "cancelled",
      changedAt: new Date(),
      changedBy: req.user.username,
    });

    await order.save();
    res.json({ message: "Item cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Return item with reason
// Return item with reason
router.put("/return/:orderId/:itemId", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;

    // Check if reason was sent
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Return reason is required" });
    }

    // Find the order
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the item inside the order
    const item = order.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in this order" });
    }

    // Check if item is eligible for return
    if (item.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Only delivered items can be returned" });
    }

    // Ensure user is available
    if (!req.user || !req.user.username) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user info missing" });
    }

    // // Update item status and push history
    // item.status = "returned";
    // item.returnReason = reason;
    // item.history.push({
    //   status: "returned",
    //   reason,
    //   changedAt: new Date(),
    //   changedBy: req.user.username,
    // });

    await order.save();

    res.json({
      message: "Item returned successfully. Refund will be initiated shortly.",
      item,
    });
  } catch (err) {
    console.error("❌ Return error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});









// ============================
// 🔴 ADMIN ROUTES
// ============================

// Fetch all orders (admin only)
router.get("/admin", authAdmin, async (req, res) => {
  try {
    const orders = await Order.find(
      {
      paymentStatus: "paid"        // ✅ Only paid orders
      }
    )
      .populate("customer", "name email")
      .populate("items.product", "title image price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 Update order/item status (admin)
router.put("/admin/:id/status", authAdmin, async (req, res) => {
  try {
    const { status, itemId } = req.body;
    const allowed = ["placed", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (itemId) {
      // Update specific item
      const item = order.items.id(itemId);
      if (!item) return res.status(404).json({ message: "Item not found" });

      item.status = status;
      item.history.push({ status, changedBy: "admin" });
    } else {
      // Update entire order
      order.orderStatus = status;
      order.items.forEach((item) => {
        item.status = status;
        item.history.push({ status, changedBy: "admin" });
      });


     // Mark all vendor notifications as seen for this order
      order.vendorNotifications.forEach((n) => {
        n.seenByAdmin = true;
      });
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// GET /api/orders/admin/notifications
router.get("/admin/notifications", authAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ "vendorNotifications.seenByAdmin": false })
      .populate("vendorNotifications.vendor", "name email")
      .populate("items.product", "title image");

    // Flatten notifications with order info
    const notifications = [];
    orders.forEach((order) => {
      order.vendorNotifications.forEach((notif) => {
        if (!notif.seenByAdmin) {
          const item = order.items.id(notif.item);
          notifications.push({
            orderId: order._id,
            itemId: notif.item,
            productTitle: item?.title || item?.product?.title,
            vendorName: notif.vendor.name,
            oldStatus: notif.oldStatus,
            newStatus: notif.newStatus,
            createdAt: notif.createdAt,
          });
        }
      });
    });

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



















// VENDOR
// 🟢 Get all orders for logged-in vendor
// VENDOR - get all orders for logged-in vendor
router.get("/vendor", vendorAuthMiddleware, async (req, res) => {
  try {
    const vendorId = req.vendor.id;

    // Fetch all orders that contain at least one item
    const orders = await Order.find({ paymentStatus: "paid", items: { $exists: true, $ne: [] } })
      .populate("customer", "name email")
      .populate("items.product", "title image price")
      .sort({ createdAt: -1 });

    // Map orders to filter items per vendor but keep all orders
    const filteredOrders = orders.map((order) => {
      // Items belonging to this vendor
      const vendorItems = order.items.filter(
        (item) => item.vendor?.toString() === vendorId.toString()
      );

      // Add a flag for each item indicating whether it belongs to this vendor
      const itemsWithFlag = order.items.map((item) => ({
        ...item.toObject(),
        isVendorItem: item.vendor?.toString() === vendorId.toString(),
      }));

      return { 
        ...order.toObject(), 
        items: itemsWithFlag,
        hasVendorItems: vendorItems.length > 0
      };
    });

    res.json(filteredOrders);
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// 🟢 Update status of a single item (vendor only)
// Update status of a single item (vendor only)
// 🟢 Update status of a single item (vendor only) and notify admin
// Update status of a single item (vendor only)
router.put(
  "/vendor/:orderId/item/:itemId/status",
  vendorAuthMiddleware,
  async (req, res) => {
    try {
      console.log("🔹 Params:", req.params);
      console.log("🔹 Body:", req.body);
      console.log("🔹 Vendor:", req.vendor);

      const { status } = req.body;
      const allowedStatuses = ["placed", "processing", "shipped", "delivered", "cancelled"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await Order.findById(req.params.orderId);
      if (!order) {
        console.log("❌ Order not found");
        return res.status(404).json({ message: "Order not found" });
      }

      const item = order.items.id(req.params.itemId);
      if (!item) {
        console.log("❌ Item not found in order");
        return res.status(404).json({ message: "Item not found" });
      }

      // console.log("Item vendor:", item.vendor, "Req vendor:", req.vendor.id);
      // if (!item.vendor || item.vendor.toString() !== req.vendor.id) {
      //   console.log("❌ Vendor mismatch");
      //   return res.status(403).json({ message: "Not authorized to update this item" });
      // }

      const oldStatus = item.status;
      item.status = status;
      item.history.push({ status, changedBy: "vendor" });

      order.vendorNotifications.push({
        item: item._id,
        vendor: req.vendor.id,
        oldStatus,
        newStatus: status,
        seenByAdmin: false,
      });

      await order.save();
      console.log("✅ Status updated & notification saved");

      return res.json({ message: `Notification sent to admin for item "${item.title}"` });
    } catch (error) {
      console.error("🔥 Error updating item status:", error);
      return res.status(500).json({ message: "Failed to send notification to admin" });
    }
  }
);



// // ✅ Get vendor's orders
// router.get("/orders/my", authMiddleware, async (req, res) => {
//   try {
//    const vendorId = req.vendor.id;// vendor from token
//     console.log("🔍 Vendor ID from token:", vendorId);

//     const orders = await Order.find({
//       "items.vendor": vendorId,
//     })
//       .populate("customer", "name email")
//       .populate("items.product", "title image price");

//     // Debug log orders and items
//     console.log("📦 Orders fetched:", orders.length);
//     orders.forEach((o) => {
//       console.log("➡️ Order", o._id, "items:");
//       o.items.forEach((it) =>
//         console.log("   product:", it.product, "vendor:", it.vendor)
//       );
//     });

//     if (!orders || orders.length === 0) {
//       return res.json([]);
//     }

//     res.json(orders);
//   } catch (err) {
//     console.error("❌ Error fetching vendor orders:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

export default router;
