// src/pages/PaymentPage.js
import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/PaymentPage.css";


export default function PaymentPage() {
  const { state } = useLocation();
  if (!state) return <h2>No order details found</h2>;

  const { cart, orderTotal, address, deliveryDate } = state;

  return (
    <div className="payment-container">
      <h2>Payment Page</h2>
      <h3>Order Summary</h3>
      <p>Delivery by: {deliveryDate}</p>
      <p>Shipping to: {address?.name}, {address?.city}</p>
      <ul>
        {cart.map((item, i) => (
          <li key={i}>
            {item.product.title} x {item.qty}
          </li>
        ))}
      </ul>
      <h4>Total Payable: ₹{orderTotal}</h4>

      {/* Later you can integrate Razorpay/Stripe etc. */}
      <button className="pay-btn">Pay Now</button>
    </div>
  );
}
