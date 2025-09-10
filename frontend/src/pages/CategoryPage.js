import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard"; 
import "../styles/CategoryPage.css";

const PRICE_BUCKETS = [
  { label: "All", min: 0, max: 5000 },
  { label: "Under ₹999", min: 0, max: 999 },
  { label: "₹1000 - ₹1999", min: 1000, max: 1999 },
  { label: "₹2000 - ₹4999", min: 2000, max: 4999 },
  { label: "₹5000+", min: 5000, max: null },
];

const DISCOUNTS = [
  { label: "All", min: 0 },
  { label: "10% or more", min: 10 },
  { label: "20% or more", min: 20 },
  { label: "30% or more", min: 30 },
  { label: "50% or more", min: 50 },
];

const RATINGS = [
  { label: "All", min: 0 },
  { label: "4★ & above", min: 4 },
  { label: "3★ & above", min: 3 },
];

const SIZES = ["26", "28", "30", "32", "34", "S", "M", "L", "XL"];
const COLORS = ["Black", "White", "Red", "Blue", "Green"];

const CATEGORY_DESCRIPTIONS = {
  "casual-shoes":
    "Get your casual style on point with our collection of men’s casual shoes. From smooth slip-ons to snazzy loafers, the collection comprises the trendiest in every style.",
  "flip-flops-slippers":
    "Stay comfortable and stylish with our flip-flops and slippers. Perfect for casual outings and everyday wear.",
  tshirts:
    "Explore our wide range of men’s and women’s t-shirts. From basic essentials to trendy prints, we’ve got it all.",
  "trousers-pants":
    "Formal & casual trousers for every occasion. Pair them with tops, shirts or blazers for a chic look.",
  default: "Browse our wide range of fashion products, handpicked for you.",
};

export default function CategoryPage() {
  const { category, subcategory } = useParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("relevance");
  const [gridCols, setGridCols] = useState(3);

  const [filters, setFilters] = useState({
    gender: [],
    brand: [],
    price: null,
    discount: null,
    colors: [],
    sizes: [],
    rating: null,
  });

  const [openFilter, setOpenFilter] = useState({
    gender: true,
    price: true,
    discount: false,
    colors: false,
    sizes: false,
    rating: false,
    brand: true,
  });

  const toggleFilterArray = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
    setPage(1);
  };

  const setSingleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const toggleSection = (key) => {
    setOpenFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = {
          categorySlug: category,      // ✅ match backend slug
          subcategorySlug: subcategory, // ✅ match backend slug
          sort: sortOption,
          page,
          limit,
        };

        if (filters.gender.length) params.gender = filters.gender.join(",");
        if (filters.brand.length) params.brand = filters.brand.join(",");
        if (filters.colors.length) params.colors = filters.colors.join(",");
        if (filters.sizes.length) params.sizes = filters.sizes.join(",");
        if (filters.price) {
          if (filters.price.min != null) params.minPrice = filters.price.min;
          if (filters.price.max != null) params.maxPrice = filters.price.max;
        }
        if (filters.discount != null) params.minDiscount = filters.discount;
        if (filters.rating != null) params.minRating = filters.rating;

        const res = await axios.get("http://localhost:5000/api/products", {
          params,
        });

        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory, filters, sortOption, page, limit]);

  const formattedTitle = subcategory
    ? `${category?.toUpperCase()} - ${subcategory.replace("-", " ")}`
    : category?.toUpperCase() || "All Products";

  const descriptionText =
    CATEGORY_DESCRIPTIONS[subcategory?.toLowerCase()] ||
    CATEGORY_DESCRIPTIONS.default;

  return (
    <div className="category-page">
      <div className="breadcrumb">
        Home / {category || "All"} {subcategory ? `/ ${subcategory}` : ""}
      </div>

      <div className="category-layout">
        {/* Sidebar */}
        <aside className="filters">
          <h3 className="filters-title">Refine By</h3>

          {/* Gender */}
          <div className="filter-section">
            <div
              className="filter-header"
              onClick={() => toggleSection("gender")}
            >
              Gender <span>{openFilter.gender ? "−" : "+"}</span>
            </div>
            {openFilter.gender && (
              <div className="filter-options">
                {["Men", "Women", "Boys", "Girls", "Unisex"].map((g) => (
                  <label key={g}>
                    <input
                      type="checkbox"
                      checked={filters.gender.includes(g)}
                      onChange={() => toggleFilterArray("gender", g)}
                    />
                    {g}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="filter-section">
            <div
              className="filter-header"
              onClick={() => toggleSection("price")}
            >
              Price <span>{openFilter.price ? "−" : "+"}</span>
            </div>
            {openFilter.price && (
              <div className="filter-options">
                {PRICE_BUCKETS.map((b) => (
                  <label key={b.label}>
                    <input
                      type="radio"
                      checked={filters.price?.label === b.label}
                      onChange={() => setSingleFilter("price", b)}
                    />
                    {b.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Discount */}
          <div className="filter-section">
            <div
              className="filter-header"
              onClick={() => toggleSection("discount")}
            >
              Discount <span>{openFilter.discount ? "−" : "+"}</span>
            </div>
            {openFilter.discount && (
              <div className="filter-options">
                {DISCOUNTS.map((d) => (
                  <label key={d.label}>
                    <input
                      type="radio"
                      checked={filters.discount === d.min}
                      onChange={() => setSingleFilter("discount", d.min)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="filter-section">
            <div
              className="filter-header"
              onClick={() => toggleSection("colors")}
            >
              Colors <span>{openFilter.colors ? "−" : "+"}</span>
            </div>
            {openFilter.colors && (
              <div className="filter-options">
                {COLORS.map((c) => (
                  <label key={c}>
                    <input
                      type="checkbox"
                      checked={filters.colors.includes(c)}
                      onChange={() => toggleFilterArray("colors", c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="filter-section">
            <div
              className="filter-header"
              onClick={() => toggleSection("sizes")}
            >
              Sizes <span>{openFilter.sizes ? "−" : "+"}</span>
            </div>
            {openFilter.sizes && (
              <div className="filter-options">
                {SIZES.map((s) => (
                  <label key={s}>
                    <input
                      type="checkbox"
                      checked={filters.sizes.includes(s)}
                      onChange={() => toggleFilterArray("sizes", s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="filter-section">
            <div
              className="filter-header"
              onClick={() => toggleSection("rating")}
            >
              Rating <span>{openFilter.rating ? "−" : "+"}</span>
            </div>
            {openFilter.rating && (
              <div className="filter-options">
                {RATINGS.map((r) => (
                  <label key={r.label}>
                    <input
                      type="radio"
                      checked={filters.rating === r.min}
                      onChange={() => setSingleFilter("rating", r.min)}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Brands */}
          <div className="filter-section">
            <div
              className="filter-header"
              onClick={() => toggleSection("brand")}
            >
              Brands <span>{openFilter.brand ? "−" : "+"}</span>
            </div>
            {openFilter.brand && (
              <div className="filter-options">
                {Array.from(new Set(products.map((p) => p.brand))).map((b) => (
                  <label key={b}>
                    <input
                      type="checkbox"
                      checked={filters.brand.includes(b)}
                      onChange={() => toggleFilterArray("brand", b)}
                    />
                    {b}
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Products Section */}
        <main className="products-section">
          {/* Category title and description */}
          <div className="category-header">
            <h1 className="category-heading">{formattedTitle}</h1>
            <p className="category-description">{descriptionText}</p>
          </div>

          {/* Top bar */}
          <div className="products-top">
            {loading ? (
              <span>Loading...</span>
            ) : (
              <span>{total} Items Found</span>
            )}

            <div className="grid-switcher">
              <span>GRID</span>
              {[3, 5].map((cols) => (
                <button
                  key={cols}
                  className={gridCols === cols ? "active" : ""}
                  onClick={() => setGridCols(cols)}
                >
                  {"▦".repeat(cols)}
                </button>
              ))}
            </div>

            <div className="sort-options">
              Sort By:
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setPage(1);
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="lowtohigh">Price: Low to High</option>
                <option value="hightolow">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Product grid */}
          <div className={`products-grid grid-${gridCols}`}>
            {!loading &&
              products.map((p) => (
                <ProductCard key={p.productId} product={p} />
              ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                className={pNum === page ? "active" : ""}
                onClick={() => setPage(pNum)}
              >
                {pNum}
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
