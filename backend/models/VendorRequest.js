import mongoose from "mongoose";

const vendorRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 18 },
    mobile: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
    },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // bcrypt hash
    gstin: { type: String, minlength: 15, maxlength: 15 },

    shopName: { type: String, required: true },
    shopAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: String,

    linkedVendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }, // optional
  },
  { timestamps: true }
);

const VendorRequest =
  mongoose.models.VendorRequest ||
  mongoose.model("VendorRequest", vendorRequestSchema);

export default VendorRequest;
