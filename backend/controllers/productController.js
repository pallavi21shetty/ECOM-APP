import Product from "../models/Product.js";

// ✅ Get all products (with advanced filters)
export const getProducts = async (req, res) => {
  try {
    let {
      categorySlug,
      subcategorySlug,
      brand,
      gender,
      search,
      minPrice,
      maxPrice,
      minDiscount,
      minRating,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    let filter = { status: "approved" }; // ✅ only approved products

    // Category filter
    if (categorySlug)
      filter.categorySlug = new RegExp(`^${categorySlug}$`, "i");

    // Subcategory filter
    if (subcategorySlug)
      filter.subcategorySlug = new RegExp(`^${subcategorySlug}$`, "i");

    // Gender filter
    if (gender) filter.gender = new RegExp(`^${gender}$`, "i");

    // Brand filter (supports multiple brands)
    if (brand) {
      const brandList = brand.split(",").map((b) => new RegExp(`^${b}$`, "i"));
      filter.brand = { $in: brandList };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Discount filter
    if (minDiscount) filter.discountPercent = { $gte: Number(minDiscount) };

    // Rating filter
    if (minRating) filter.rating = { $gte: Number(minRating) };

    // Search filter
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { brand: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
        { subcategory: new RegExp(search, "i") },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    let sortOption = {};
    if (sort === "lowtohigh") sortOption.price = 1;
    else if (sort === "hightolow") sortOption.price = -1;
    else if (sort === "newest") sortOption.createdAt = -1;

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ✅ Get single product by productId
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// ✅ Add a new product
export const addProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
};

// ✅ Update product
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { productId: req.params.productId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      productId: req.params.productId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
