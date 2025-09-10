// src/pages/BrandPage.js
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CategoryPage.css"; // reuse same CSS
import ProductCard from "../components/ProductCard"; // ✅ Reusable component

const PRICE_BUCKETS = [
  { label: "Any", min: null, max: null },
  { label: "Under ₹999", min: null, max: 999 },
  { label: "₹1000 - ₹1999", min: 1000, max: 1999 },
  { label: "₹2000 - ₹4999", min: 2000, max: 4999 },
  { label: "₹5000+", min: 5000, max: null },
];

export default function BrandPage() {
  const { brand } = useParams();

  // Data
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // UI state
  const [sortOption, setSortOption] = useState("relevance");
  const [gridCols, setGridCols] = useState(3);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Filters
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedBrands, setSelectedBrands] = useState(brand ? [brand] : []);
  const [priceRange, setPriceRange] = useState({ min: null, max: null });

  // Collapsible filters
  const [openFilter, setOpenFilter] = useState({
    gender: true,
    price: true,
    brands: true,
  });

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = { page, limit, sort: sortOption };

        // brand from URL
        if (brand) params.brand = brand;

        // gender filter
        if (selectedGender) params.gender = selectedGender;

        // multiple brand selection
        if (selectedBrands.length > 0) params.brand = selectedBrands.join(",");

        // price filters
        if (priceRange.min != null) params.minPrice = priceRange.min;
        if (priceRange.max != null) params.maxPrice = priceRange.max;

        const res = await axios.get("http://localhost:5000/api/products", {
          params,
        });

        let items = [];
        let count = 0;

        if (Array.isArray(res.data)) {
          items = res.data;
          count = res.data.length;
        } else if (res.data && Array.isArray(res.data.products)) {
          items = res.data.products;
          count = res.data.total || res.data.products.length;
        }

        setProducts(items);
        setTotal(count);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [brand, selectedGender, selectedBrands, priceRange, sortOption, page]);

  // Collect brand options from current product list
  const brandOptions = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const s = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(s).sort();
  }, [products]);

  const toggleFilter = (name) => {
    setOpenFilter({ ...openFilter, [name]: !openFilter[name] });
  };

  const handleBrandChange = (b) => {
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((br) => br !== b) : [...prev, b]
    );
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="category-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">Home / Brands / {brand}</div>

      <div className="category-layout">
        {/* Sidebar Filters */}
        <aside className="filters">
          <h3 className="filters-title">Refine By</h3>

          {/* Gender */}
          <div className="filter-section">
            <div
              className="filter-header"
              onClick={() => toggleFilter("gender")}
            >
              Gender <span>{openFilter.gender ? "−" : "+"}</span>
            </div>
            {openFilter.gender && (
              <div className="filter-options">
                {["Men", "Women", "Boys", "Girls", "Unisex"].map((g) => (
                  <label key={g}>
                    <input
                      type="radio"
                      name="gender"
                      checked={selectedGender === g}
                      onChange={() => {
                        setSelectedGender(g);
                        setPage(1);
                      }}
                    />
                    {g}
                  </label>
                ))}
                <label>
                  <input
                    type="radio"
                    name="gender"
                    checked={!selectedGender}
                    onChange={() => {
                      setSelectedGender("");
                      setPage(1);
                    }}
                  />
                  Any
                </label>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="filter-section">
            <div
              className="filter-header"
              onClick={() => toggleFilter("price")}
            >
              Price <span>{openFilter.price ? "−" : "+"}</span>
            </div>
            {openFilter.price && (
              <div className="filter-options">
                {PRICE_BUCKETS.map((b) => (
                  <label key={b.label}>
                    <input
                      type="radio"
                      name="price"
                      checked={
                        (priceRange.min ?? null) === (b.min ?? null) &&
                        (priceRange.max ?? null) === (b.max ?? null)
                      }
                      onChange={() => {
                        setPriceRange({ min: b.min, max: b.max });
                        setPage(1);
                      }}
                    />
                    {b.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Brands */}
          <div className="filter-section">
            <div
              className="filter-header"
              onClick={() => toggleFilter("brands")}
            >
              Brands <span>{openFilter.brands ? "−" : "+"}</span>
            </div>
            {openFilter.brands && (
              <div className="filter-options">
                {brandOptions.length ? (
                  brandOptions.map((br) => (
                    <label key={br}>
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(br)}
                        onChange={() => handleBrandChange(br)}
                      />
                      {br}
                    </label>
                  ))
                ) : (
                  <p>No brands</p>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Products Section */}
        <main className="products-section">
          {/* ✅ Brand Header inside products section */}
          <div className="category-header">
            <h1 className="category-heading">{brand}</h1>
          </div>

          {/* Top Bar */}
          <div className="products-top">
            {loading ? (
              <span>Loading...</span>
            ) : (
              <span>{total} Items Found</span>
            )}

            {/* Grid Switcher */}
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

            {/* Sort Options */}
            <div className="sort-options">
              Sort By:
              <select
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setPage(1);
                }}
                value={sortOption}
              >
                <option value="relevance">Relevance</option>
                <option value="lowtohigh">Price: Low to High</option>
                <option value="hightolow">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className={`products-grid grid-${gridCols}`}>
            {!loading && products.length === 0 && (
              <p className="no-products">No products found.</p>
            )}

            {!loading &&
              Array.isArray(products) &&
              products.map((p) => (
                <ProductCard
                  key={p.productId || p._id}
                  product={p}
                />
              ))}
          </div>

          {/* Pagination */}
          {!loading && total > limit && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span>
                Page {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
