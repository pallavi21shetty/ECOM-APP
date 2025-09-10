import React, { useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/CartPage.css";
import FeaturesSection from "../components/FeaturesSection";
import "../styles/FeaturesSection.css"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, message, moveToWishlist } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const navigate = useNavigate();

  const deliveryFee = 99.0;

  // 🔍 Debug cart values
  console.log("🛒 Cart contents:", cart);

  // ✅ Bag total = sum of selling price (price)
  const bagTotal = useMemo(
    () => cart.reduce((s, it) => s + (it.price ?? 0) * (it.qty ?? 1), 0),
    [cart]
  );

  // ✅ Bag discount = sum of (mrp - price)
  const bagDiscount = useMemo(
    () =>
      cart.reduce(
        (s, it) =>
          s + ((it.mrp ?? it.price) - (it.price ?? 0)) * (it.qty ?? 1),
        0
      ),
    [cart]
  );

  const orderTotal = useMemo(() => {
    const couponAdj = appliedCoupon ? appliedCoupon.amount : 0;
    return Math.max(0, bagTotal - couponAdj + deliveryFee);
  }, [bagTotal, appliedCoupon]);

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) return alert("Please enter a coupon code");

    if (code === "TRENDSFREEDEL" && bagTotal > 299) {
      setAppliedCoupon({
        code,
        description: "Free delivery on orders above ₹299",
        amount: deliveryFee,
      });
      return alert("Coupon applied: free delivery");
    }

    if (code === "SAVE100" && bagTotal > 500) {
      setAppliedCoupon({
        code,
        description: "Flat ₹100 off",
        amount: 100,
      });
      return alert("Coupon applied: ₹100 off");
    }

    alert("Coupon not applicable or invalid");
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
  }

  // ✅ If cart is empty
  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <h2>Your Shopping Bag is Empty!!</h2>
          <p>
            Sign in to link items to your account, or view items already in your
            account
          </p>
          <button className="continue-btn" onClick={() => navigate("/")}>
            CONTINUE SHOPPING
          </button>

          <div className="cart-benefits">
            <div>🛡 Secure Payments</div>
            <div>💵 Cash on Delivery</div>
            <div>✅ Assured Quality</div>
            <div>🔄 Easy Returns</div>
          </div>
        </div>
         <FeaturesSection />
      </div>
    );
  }

  // ✅ If cart has items
  return (
    <div className="cart-container">
      {message && <div className="cart-message">{message}</div>}

      <div className="cart-header">
        <h1 className="cart-title">
          My Bag ({cart.length} item{cart.length !== 1 ? "s" : ""})
        </h1>
        {cart.length > 0 && (
          <button
            className="wishlist-add-btn"
            onClick={() => navigate("/wishlist")}
          >
            + Add From Wishlist
          </button>
        )}
      </div>

      <div className="cart-layout">
        {/* Left side */}
        <div className="cart-items">
          {cart.map((item, index) => {
            const productId = item.product._id || item.productId;

            return (
              <div
                key={productId + item.size + item.color}
                className="cart-item"
              >
                {/* Product Image */}
                <img
                  src={item.image || item.img || item.product.image}
                  alt={item.title || item.product.title}
                  className="item-image"
                />

                {/* Details Section */}
                <div className="item-content">
                  <div className="item-header">
                    <div className="item-info">
                      <p className="item-title">
                        {item.title || item.product.title}
                      </p>
                      <p className="item-sub">Size: {item.size || "M"}</p>
                      {item.color && <p className="item-sub">Color: {item.color}</p>}
                    </div>

                    {/* Price Section */}
                    <div className="item-price">
                      {item.mrp ? (
                        <>
                          <p
                            className={
                              item.mrp > item.price ? "original" : "mrp"
                            }
                          >
                            ₹{((item.mrp ?? 0) * (item.qty ?? 1)).toFixed(2)}
                          </p>
                          <p className="discounted">
                            ₹{((item.price ?? 0) * (item.qty ?? 1)).toFixed(2)}
                          </p>
                          {item.mrp > item.price && (
                            <p className="savings">
                              You Save ₹
                              {(
                                ((item.mrp ?? 0) - (item.price ?? 0)) *
                                (item.qty ?? 1)
                              ).toFixed(2)}{" "}
                              (
                              {item.discountPercent ??
                                Math.round(
                                  (((item.mrp ?? 0) - (item.price ?? 0)) /
                                    (item.mrp ?? 1)) *
                                    100
                                )}
                              % OFF)
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="discounted">
                          ₹{((item.price ?? 0) * (item.qty ?? 1)).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Qty + Actions */}
                  <div className="item-actions">
                    <div className="qty-controls">
                      <button
                        disabled={(item.qty ?? 1) <= 1}
                        onClick={() =>
                          updateQuantity?.(
                            productId,
                            item.size,
                            item.color,
                            Math.max(1, (item.qty ?? 1) - 1)
                          )
                        }
                      >
                        -
                      </button>
                      <span className="qty-display">{item.qty ?? 1}</span>
                      <button
                        disabled={(item.qty ?? 1) >= 10}
                        onClick={() =>
                          updateQuantity?.(
                            productId,
                            item.size,
                            item.color,
                            Math.min(10, (item.qty ?? 1) + 1)
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <div className="action-links">
                      <button
                        className="delete"
                        onClick={() =>
                          removeFromCart?.(productId, item.size, item.color)
                        }
                      >
                        Delete
                      </button>
                      {/* Move to Wishlist */}
            <button
              className="wishlist"
              onClick={() => moveToWishlist(item)}
            >
              ♡ Move to Wishlist
            </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add from wishlist button - BOTTOM */}
          {cart.length > 0 && (
            <button
              className="wishlist-add-btnn"
              onClick={() => navigate("/wishlist")}
            >
              + Add From Wishlist
            </button>
          )}
        </div>

        {/* Right side */}
        <div className="cart-summary">
          <h3>Order Details</h3>
          <div className="summary-row">
            <span>Bag total</span>
            <span>₹{bagTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Bag discount</span>
            <span>-₹{bagDiscount.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Convenience Fee</span>
            <span>₹{deliveryFee}</span>
          </div>
          <div className="summary-total">
            <span>Order Total</span>
            <span>₹{orderTotal.toFixed(2)}</span>
          </div>
          <button 
  className="checkout-btn" 
  onClick={() => navigate("/checkout")}
>
  PROCEED TO SHIPPING
</button>

          {/* Coupon Section */}
          <div className="coupon-box">
            <h4>Apply Coupon</h4>
            {appliedCoupon ? (
              <div className="applied-coupon">
                <span>
                  {appliedCoupon.code} - {appliedCoupon.description}
                </span>
                <button onClick={removeCoupon}>Remove</button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button onClick={applyCoupon}>APPLY</button>
              </div>
            )}

            <div className="available-coupons">
              <h5>Available Coupons</h5>
              <ul>
                <li>
                  <strong>TRENDSFREEDEL</strong> - Free delivery on orders above
                  ₹299
                </li>
                <li>
                  <strong>SAVE100</strong> - Flat ₹100 off on orders above ₹500
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
       <FeaturesSection />
    </div>
  );
}
