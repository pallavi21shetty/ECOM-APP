// src/pages/ProductDetails.js
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import "../styles/ProductDetails.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ useCart now also brings isInCart
  const {  addToCart, isInCart } = useCart();
  const { user, setShowLoginModal, setPendingWishlistItem, setRedirectPath } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("returns");
  const [error, setError] = useState("");

  const wishlistId = product?._id?.toString() || product?.id?.toString();
  
  // ✅ Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/products/id/${id}`
        );
        const fetched = res.data.product || res.data;
        setProduct(fetched);

        // default color
        if (fetched.colors?.length > 0) {
          const firstColor = fetched.colors[0];
          setSelectedColor(firstColor);
          const colorImgs = fetched.images.filter((img) =>
            img.toLowerCase().includes(firstColor.toLowerCase())
          );
          if (colorImgs.length > 0) setMainImage(colorImgs[0]);
          else if (fetched.image) setMainImage(fetched.image);
        } else {
          if (fetched.image) setMainImage(fetched.image);
          else if (fetched.images?.length > 0) setMainImage(fetched.images[0]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ✅ Filter images by color
  const filteredImages = useMemo(() => {
    if (!product?.images) return [];
    if (selectedColor) {
      return product.images.filter((img) =>
        img.toLowerCase().includes(selectedColor.toLowerCase())
      );
    }
    return [];
  }, [product, selectedColor]);

  const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: product.title,
      text: `Check out this product: ${product.title}`,
      url: window.location.href,
    }).catch((err) => console.log("Share canceled", err));
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  }
};

useEffect(() => {
  if (product) {
    let viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    // avoid duplicates
    viewed = viewed.filter((p) => p._id !== product._id);

    // add latest at top with all required fields
    viewed.unshift({
      _id: product._id || product.id,
      brand: product.brand || product.name || "Brand Name",
      title: product.title || product.name || "Product Name",
      image: product.image || "",
      price: product.price || 0,
      mrp: product.mrp || 0,
      discountPercent: product.discountPercent || 0,
      rating: product.rating || 0,
      ratingCount: product.ratingCount || 0
    });

    // keep only last 5
    if (viewed.length > 5) viewed = viewed.slice(0, 5);

    localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
  }
}, [product]);

  // ✅ Auto slideshow
  useEffect(() => {
    if (!filteredImages || filteredImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [filteredImages]);

  // ✅ Update main image when current index changes
  useEffect(() => {
    if (filteredImages.length > 0) {
      setMainImage(filteredImages[currentIndex]);
    }
  }, [currentIndex, filteredImages]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="error">Product not found</div>;

  // ✅ Normalize product id
  const normalizedId = product?._id?.toString() || product?.productId || product?.id;

   // ✅ Add to cart handler
  const handleAddToCart = () => {
    if (!selectedSize) {
      setError("⚠ Please select a size");
      return;
    }
    setError("");

    const mrpValue = product.mrp ?? product.price ?? 0;
    const priceValue = product.price ?? mrpValue;
    const discountPercent =
      product.discountPercent ??
      (mrpValue > priceValue
        ? Math.round(((mrpValue - priceValue) / mrpValue) * 100)
        : 0);

    const productForCart = {
      productId: product._id,
      qty: 1,
      size: selectedSize,
      color: selectedColor,
      price: priceValue,
      mrp: mrpValue,
      discountPercent,
      image: mainImage || product.image || product.images?.[0] || "",
      title: product.title,
    };

    addToCart(productForCart);
  };

  // ✅ Wishlist toggle
  const handleWishlist = () => {
    const wishlistItem = {
      id: wishlistId,
        productCode: product.id,
      title: product.title,
      brand: product.brand,
      img: mainImage || product.image || product.images?.[0],
      price: product.price,
      mrp: product.mrp,
      sizes: product.sizes || [],
      colors: product.colors || [],
    };

    if (!user) {
      setPendingWishlistItem(wishlistItem);
      setRedirectPath(location.pathname);
      setShowLoginModal(true);
      return;
    }

    toggleWishlist(wishlistItem); // no await here
  };

  return (
    <div className="page-container">
      {error && (
        <div className="error-banner">
          {error}
          <button className="close-btn" onClick={() => setError("")}>
            &times;
          </button>
        </div>
      )}

      <div className="product-details">
        {/* ---------- Left Section (Images) ---------- */}
        <div className="images">
          {/* Thumbnails */}
          <div className="thumbs">
            {filteredImages?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`thumb-${idx}`}
                className={mainImage === img ? "active" : ""}
                onClick={() => {
                  setMainImage(img);
                  setCurrentIndex(idx);
                }}
              />
            ))}
          </div>

          {/* Main image */}
          <div className="main-image-wrapper">
            <div className="main-image-container">
              <img src={mainImage} alt={product.title} className="main-image" />

              {/* Share */}
              <button className="share-btn" onClick={handleShare}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>

              {/* Nav arrows */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    className="nav-btn left"
                    onClick={() =>
                      setCurrentIndex(
                        (prev) =>
                          (prev - 1 + filteredImages.length) %
                          filteredImages.length
                      )
                    }
                  >
                    {"<"}
                  </button>
                  <button
                    className="nav-btn right"
                    onClick={() =>
                      setCurrentIndex(
                        (prev) => (prev + 1) % filteredImages.length
                      )
                    }
                  >
                    {">"}
                  </button>
                </>
              )}
            </div>

            {/* Tabs */}
            <div className="product-tabs">
              <div className="tab-headers">
                <button
                  className={`tab-btn ${
                    activeTab === "returns" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("returns")}
                >
                  RETURNS
                </button>
                <button
                  className={`tab-btn ${
                    activeTab === "promise" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("promise")}
                >
                  OUR PROMISE
                </button>
              </div>
              <div className="tab-content">
                {activeTab === "returns" ? (
                  <p>
                    7 day Return and Exchange{" "}
                    <a
                      href="/returns"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      click here
                    </a>
                    .
                  </p>
                ) : (
                  <p>100% Original Products with Ajio Promise ✅</p>
                )}
              </div>
            </div>

            <a
              href="/faq"
              className="faq-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Service FAQs
            </a>
          </div>
        </div>

        {/* ---------- Right Section ---------- */}
        <div className="info">
          <h2 className="brand">{product.brand}</h2>
          <h1 className="title">{product.title}</h1>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="rating-box">
              <span className="rating-star">⭐ {product.rating}</span>
              {product.ratingCount > 0 && (
                <span className="rating-count">
                  {" "}
                  ({product.ratingCount}) Ratings
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="price-box">
            <span className="offer">₹{product.price}</span>
            {product.mrp && <span className="mrp"> ₹{product.mrp}</span>}
            {product.discountPercent > 0 && product.mrp && (
              <span className="discount">
                {" "}
                ({product.discountPercent}% OFF)
              </span>
            )}
          </div>
          <p className="tax">Inclusive of all taxes</p>

          {/* Offers */}
          <div className="offer-box">
            <p>
              Use Code <b>TRENDSFRE</b> to get extra discount 🎉
            </p>
            <p>Free Delivery on Orders above ₹299</p>
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="color-section">
              <p className="label">Color</p>
              <div className="colors">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    className={`color-btn ${
                      selectedColor === c ? "active" : ""
                    }`}
                    style={{ backgroundColor: c.toLowerCase() }}
                    onClick={() => {
                      setSelectedColor(c);
                      const colorImgs = product.images.filter((img) =>
                        img.toLowerCase().includes(c.toLowerCase())
                      );
                      if (colorImgs.length > 0) {
                        setMainImage(colorImgs[0]);
                        setCurrentIndex(0);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="size-section">
              <p className="label">Select Size</p>
              <div className="sizes">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`size-btn ${
                      selectedSize === s ? "active" : ""
                    }`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="size-guide">
                <span className="icon">📏</span> Check Size Chart
                <span className="new-label">NEW</span>
              </p>
            </div>
          )}

          {/* Delivery */}
          <div className="delivery-box">
            <p>Select your size to know estimated delivery date 🚚</p>
          </div>

          {/* Buttons */}
          <div className="actionss">
             {isInCart(normalizedId, selectedSize, selectedColor) ? (
              <button className="go-btnn" onClick={() => navigate("/cart")}>
                GO TO BAG
              </button>
            ) : (
              <button className="add-btnn" onClick={handleAddToCart}>
                ADD TO BAG
              </button>
            )}

            <p className="quality-line">
              HANDPICKED STYLES | ASSURED QUALITY
            </p>

            {/* Wishlist Button */}
            <button className="wishlist-btnn" onClick={handleWishlist}>
              {isInWishlist(wishlistId)
                ? "♡ REMOVE FROM WISHLIST"
                : "♡ ADD TO WISHLIST"}
            </button>
          </div>

          {/* Product Details */}
          <div className="details-section">
            <h3>Product Details</h3>
            <div className="details-grid">
              {Object.entries(product.details || {}).map(([key, value]) => (
                <div key={key}>
                  <h4>{key.replace(/([A-Z])/g, " $1")}</h4>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
