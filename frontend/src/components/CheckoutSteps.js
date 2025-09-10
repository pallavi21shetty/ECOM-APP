// src/components/CheckoutSteps.js
import React from "react";
import { FaShoppingBag } from "react-icons/fa";
import { FaRegCreditCard } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ import auth
import "../styles/CheckoutSteps.css";

export default function CheckoutSteps({ step }) {
  const { user, logout } = useAuth(); // ✅ access user + logout
  const navigate = useNavigate();

  return (
    <header className="checkout-header">
      {/* Left: Logo */}
      <div className="checkout-logo">
        <h1>AJIO</h1>
      </div>

      {/* Middle: Steps */}
      <div className="checkout-steps">
        {/* Bag Step */}
        <div
          className={`step ${step > 0 ? "completed" : ""} ${
            step === 0 ? "active" : ""
          }`}
        >
          <FaShoppingBag />
          <span>Bag</span>
        </div>

        {/* Delivery Step */}
        <div
          className={`step ${step > 1 ? "completed" : ""} ${
            step === 1 ? "active" : ""
          }`}
        >
          <MdLocationOn />
          <span>Delivery Details</span>
        </div>

        {/* Payment Step */}
        <div className={`step ${step === 2 ? "active" : ""}`}>
          <FaRegCreditCard />
          <span>Payment</span>
        </div>
      </div>

      {/* Right: Links */}
      <div className="checkout-links">
        {user ? (
          <>
            <span className="profile-link">Hi, {user.name || "User"}</span>
            <Link to="/profile">My Account</Link>
            <button
              className="signout-btn"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/signin">Sign In / Join AJIO</Link>
        )}

        <a href="/help">Customer Care</a>
        <a href="/ajio-luxe" className="ajio-luxe">
          Visit AJIOLUXE
        </a>
      </div>
    </header>
  );
}
