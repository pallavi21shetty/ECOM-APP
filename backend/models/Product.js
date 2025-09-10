import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, index: true },

    // Basic details
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, index: true },
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
      index: true 
    },
    category: { type: String, required: true, index: true },        // e.g. Men, Women, Kids
    categorySlug: { type: String, required: true, lowercase: true },// e.g. "men"
    section: { type: String },                                      // e.g. "Western Wear"
    subcategory: { type: String, required: true, index: true },     // e.g. Jackets & Coats
    subcategorySlug: { type: String, required: true, lowercase: true },

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

    // ✅ Product details (flexible)
    details: {
      type: Map,
      of: String,
      default: {}
    }
  },
  { timestamps: true }
);

// Compound indexes for fast filtering like Ajio
ProductSchema.index({ brand: 1, gender: 1, category: 1, subcategory: 1 });

export default mongoose.model("Product", ProductSchema);
