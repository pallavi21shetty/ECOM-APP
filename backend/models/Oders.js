import mongoose from "mongoose";

// Schema for individual items in the order
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null }, // vendor = User with role=vendor
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }, // snapshot price
  title: String, // snapshot
  image: String, // snapshot
  status: {
    type: String,
    enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
    default: "placed",
  },
  history: [
    {
      status: String,
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: String }, // "vendor" or "admin"
    },
  ],
});

// Schema for vendor notifications (pending admin approval)
const vendorNotificationSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, required: true }, // order item ID
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  oldStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  seenByAdmin: { type: Boolean, default: false },
});

// Main order schema
const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    paymentMethod: { type: String, enum: ["cod", "razorpay", "stripe"], default: "cod" },
    transactionId: String,
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    orderStatus: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    history: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String }, // "admin" or "user"
      },
    ],
    // ✅ Track vendor updates that need admin approval
    vendorNotifications: { type: [vendorNotificationSchema], default: [] },
  },
  { timestamps: true }
);

// Prevent model overwrite issues in dev/hot reload
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
