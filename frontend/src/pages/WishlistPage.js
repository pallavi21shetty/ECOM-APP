// src/pages/WishlistPage.js
import React, { useState, useEffect } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaShoppingBag, FaHeart, FaTimes } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import "../styles/WishlistPage.css";
import FeaturesSection from "../components/FeaturesSection";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, message } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeProduct, setActiveProduct] = useState(null);
  const [localWishlist, setLocalWishlist] = useState([]);

  // ✅ Update localWishlist whenever context changes
  useEffect(() => {
    setLocalWishlist(wishlist);
  }, [wishlist]);

  // ✅ Add to cart with selected size
  const handleAddToCart = (product, size) => {
    addToCart({ ...product, size });
    setActiveProduct(null);
  };

  // 🔹 Empty Wishlist
  if (!localWishlist || localWishlist.length === 0) {
    return (
      <div className="wishlist-empty">
        {message && <div className="wishlist-message-bar">{message}</div>}
        <h2>My Wishlist</h2>
        <p>Your Wishlist is empty!!</p>
        <p>
          Add a few products and then explore the coolest way to shop clothes
          online!
        </p>
        <button className="continue-btn" onClick={() => navigate("/")}>
          CONTINUE SHOPPING
        </button>

        <div className="wishlist-icons">
          <div>
            <FaShoppingBag size={30} />
            <p>Easy Exchange</p>
          </div>
          <div>
            <FaHeart size={30} />
            <p>100% Handpicked</p>
          </div>
          <div>
            <FaShoppingBag size={30} />
            <p>Assured Quality</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Wishlist With Products
  return (
    <div className="wishlist-container">
      {message && <div className="wishlist-message-bar">{message}</div>}

      <h2 className="wishlist-title">My Wishlist</h2>
      <div className="wishlist-grid">
        {localWishlist.map((item) => {
          const discountPercent =
            item.mrp && item.price
              ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
              : 0;

          const productSizes = item.sizes || [];

          // Use normalized ID from context
          const itemId = item.id || item._id;

          return (
            <div key={itemId} className="wishlist-card">
              {/* Delete Icon */}
              <button
                className="delete-icon"
                onClick={() => removeFromWishlist(itemId)}
              >
                <FaTrash />
              </button>

              {/* Product Image + Size Popup */}
              <div className="wishlist-img-wrapper">
              <img
  src={item.img || item.image || item.images?.[0]}
  alt={item.title}
  className="wishlist-img"
    onClick={() => navigate(`/product/${item.productId}`)}

/>

                {item.stock === 0 && (
                  <div className="out-of-stock">OUT OF STOCK</div>
                )}

                {/* Size Selector Overlay */}
                {activeProduct?.id === itemId && (
                  <div className="size-popup">
                    <div className="size-popup-header">
                      <span>Select Size</span>
                      <FaTimes
                        className="close-btn"
                        onClick={() => setActiveProduct(null)}
                      />
                    </div>
                    <div className="size-options">
                      {productSizes.length > 0 ? (
                        productSizes.map((size) => (
                          <button
                            key={size}
                            className="size-btn"
                            onClick={() => handleAddToCart(item, size)}
                          >
                            {size}
                          </button>
                        ))
                      ) : (
                        <p>No sizes available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <button
                className="cart-icon"
                onClick={() => setActiveProduct({ ...item, id: itemId })}
              >
                <FaShoppingBag />
              </button>

              {/* Info Section */}
              <div className="wishlist-info">
                <h3 className="wishlist-title-text">{item.title}</h3>
                <p className="wishlist-brand">{item.brand}</p>
                <div className="wishlist-price">
                  <span className="price">₹{item.price}</span>
                  {item.mrp && <span className="mrp">₹{item.mrp}</span>}
                  {discountPercent > 0 && (
                    <span className="discount">({discountPercent}% OFF)</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
       <FeaturesSection />
    </div>
  );
}
