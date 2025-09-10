import React from "react";
import { Link } from "react-router-dom";
import "../styles/ProductCard.css";

const ProductCard = ({ product }) => {
  // Ensure we always have an ID to link
  const productId = product.productId || product._id;

  return (
    <div className="container">
    <div className="product-card">
      {/* Make whole card clickable */}
      <Link to={`/product/${productId}`} className="card-link">
        <div className="image-container">
          <img
            src={product.image || "/placeholder.png"}
            alt={product.title || "Product"}
          />
          <div className="quick-view">QUICK VIEW</div>
        </div>

        {/* Brand + Title */}
        <h5 className="brand">{product.brand || "Unknown Brand"}</h5>
        <h4 className="title">{product.title || "Untitled Product"}</h4>

        {/* ✅ Rating with count */}
        {product.rating && (
          <p className="rating">
            ⭐ {product.rating}
            {product.ratingCount && (
              <span className="rating-count"> | {product.ratingCount}</span>
            )}
          </p>
        )}

        {/* ✅ Price Block */}
        <div className="price-block">
          <span className="offer-price">₹{product.price}</span>
          {product.mrp && (
            <span className="mrp">₹{product.mrp}</span>
          )}
          {product.discountPercent > 0 && product.mrp && (
            <span className="discount">
              {product.discountPercent}% off
            </span>
          )}
        </div>
      </Link>
    </div>
    </div>
  );
};

export default ProductCard;
