import mongoose from "mongoose";
import slugify from "slugify"; // ✅ npm install slugify

const ProductSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, index: true },

    // Basic details
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, index: true },
    description: { type: String }, // ✅ extra for SEO/product details
    price: { type: Number, required: true },
    mrp: { type: Number },
    discountPercent: { type: Number },

    // Ratings
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // Classification
    gender: {
      type: String,
      enum: ["Men", "Women", "Boys", "Girls", "Unisex"],
      required: true,
      index: true,
    },
    category: { type: String, required: true, index: true }, // e.g. Men, Women
    categorySlug: { type: String, required: true, lowercase: true },
    section: { type: String }, // e.g. "Western Wear"
    subcategory: { type: String, required: true, index: true }, // e.g. Jackets
    subcategorySlug: { type: String, required: true, lowercase: true },

    // Slug for product detail page
    productSlug: { type: String, unique: true, lowercase: true },

    // Media
    image: { type: String, required: true },
    images: [{ type: String }],

    // Variants
    colors: [{ type: String }],
    sizes: [{ type: String }],

    // Inventory
    stock: { type: Number, default: 100 },

    // Misc
    tags: [{ type: String }],

    // Flexible product details (key-value)
    details: {
      type: Map,
      of: String,
      default: {},
    },

    // Vendor system
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Active flag (soft delete)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Compound indexes for fast filtering like Ajio/Myntra
ProductSchema.index({ brand: 1, gender: 1, category: 1, subcategory: 1 });

// ✅ Virtual field for discounted price
ProductSchema.virtual("discountedPrice").get(function () {
  if (this.mrp && this.discountPercent) {
    return Math.round(this.mrp - (this.mrp * this.discountPercent) / 100);
  }
  return this.price;
});

// ✅ Auto-generate product slug from title
ProductSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.productSlug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Product", ProductSchema);
