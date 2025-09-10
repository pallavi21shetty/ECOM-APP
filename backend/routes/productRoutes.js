import express from "express";
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

/**
 * ✅ GET /api/products
 * Supports filters via query params:
 *  - category (e.g. ?category=Men)
 *  - subcategory (e.g. ?subcategory=Tshirts)
 *  - brand (comma-separated: ?brand=DNMX,Levis)
 *  - gender (e.g. ?gender=Men)
 *  - minPrice, maxPrice (e.g. ?minPrice=500&maxPrice=2000)
 *  - sort (relevance | lowtohigh | hightolow | newest)
 *  - page & limit for pagination (e.g. ?page=2&limit=20)
 */
router.get("/", getProducts);

// ✅ Single product by ID
router.get("/id/:productId", getProductById);

// ✅ CRUD
router.post("/", addProduct);
router.put("/id/:productId", updateProduct);
router.delete("/id/:productId", deleteProduct);

export default router;
