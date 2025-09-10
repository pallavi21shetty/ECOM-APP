import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true }, // vendor = User with role=vendor
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }, // snapshot price
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

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: Number,
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
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
