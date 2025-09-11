import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/PaymentPage.css";

export default function PaymentPage() {
  const { state } = useLocation();
  if (!state) return <h2>No order details found</h2>;

  const { cart, orderTotal, address, deliveryDate } = state;

  // 🧮 Compute totals like ShippingPage
  const bagTotal = cart.reduce(
    (sum, item) => sum + item.product.mrp * item.qty,
    0
  );
  const bagDiscount = cart.reduce(
    (sum, item) => sum + (item.product.mrp - item.product.price) * item.qty,
    0
  );
  const deliveryFee = 0; // showing Free
  const platformFee = 29;

  return (
    <div className="payment-wrapper">
      {/* ✅ Redeem Section */}
      <div className="redeem-section">
        <div className="redeem-card">
          <p>
            Get 10% Instant Discount of up to Rs. 1000 on a minimum transaction
            value of Rs 3999 using ICICI Bank Credit Cards. Valid once per card
            per month. <a href="#">T&C</a>
          </p>
        </div>
        <div className="redeem-card">
          <p>
            Get 10% Instant Discount of up to Rs. 1000 on a minimum transaction
            value of Rs 3000 using ICICI Bank Credit Cards. <a href="#">T&C</a>
          </p>
        </div>
        <button className="otp-btn">Verify with OTP</button>
      </div>

      <div className="payment-layout">
        {/* ✅ Left Side: Payment Modes */}
        <div className="payment-modes">
          <h3>Select Payment Mode</h3>
          <ul className="mode-list">
            <li className="active">Credit / Debit Card</li>
            <li>NetBanking</li>
            <li>Wallet</li>
            <li>UPI</li>
            <li>EMI</li>
            <li>Cash on Delivery</li>
          </ul>
        </div>

        {/* ✅ Right Side (2 Columns: Card Form + Order Summary) */}
        <div className="payment-details">
          {/* Add Card Form */}
          <div className="add-card">
            <h3>Add New Card</h3>
            <input type="text" placeholder="Card Number" />
            <input type="text" placeholder="Name on Card" />

            <div className="row">
              <select>
                <option>Month</option>
              </select>
              <select>
                <option>Year</option>
              </select>
              <input type="text" placeholder="CVV" />
            </div>

            <div className="checkbox">
              <input type="checkbox" id="saveCard" />
              <label htmlFor="saveCard">Save this card securely</label>
            </div>

            <button className="pay-btn">PAY ₹{orderTotal} SECURELY</button>
          </div>

          {/* Dynamic Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <p>Bag Total: ₹{bagTotal}</p>
            <p>Bag Discount: -₹{bagDiscount}</p>
            <p>
              Delivery Fee: <s>₹99</s> Free
            </p>
            <p>Platform Fee: ₹{platformFee}</p>
            <hr />
            <h4>Amount Payable: ₹{orderTotal}</h4>
            <p className="delivery">Delivery by: {deliveryDate}</p>
            <p className="shipping">
              Shipping to: {address?.name}, {address?.city}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
