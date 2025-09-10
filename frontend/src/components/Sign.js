// frontend/src/components/Sign.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Otp from "./Otp";
import Register from "./Register";
import { useAuth } from "../context/AuthContext"; // ✅ import AuthContext
import "../styles/Sign.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Sign() {
  const [mobile, setMobile] = useState("");
  const [step, setStep] = useState("phone"); // phone | otp | register
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ get login function from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalized = String(mobile).replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(normalized)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/auth/check-user`, { mobile: normalized });
      setLoading(false);

      const data = res.data || {};

      const isExisting =
        data.exists === true ||
        data.status === "existing" ||
        (data.success === true && data.exists === true) ||
        (data.success === true && data.status === "existing");

      const isNew =
        data.exists === false ||
        data.status === "new" ||
        (data.success === true && data.status === "new");

      if (isExisting) {
        setStep("otp");
        setShowOtpPopup(true);
      } else if (isNew) {
        setStep("register");
      } else {
        if (typeof data.message === "string" && /exist/i.test(data.message)) {
          setStep("otp");
          setShowOtpPopup(true);
        } else {
          setStep("register");
        }
      }
    } catch (err) {
      setLoading(false);
      console.error("check-user error:", err);
      alert(err?.response?.data?.message || "Server error while checking mobile");
    }
  };

  // ✅ OTP step
  if (step === "otp" && showOtpPopup) {
    return (
      <Otp
        mobile={String(mobile).replace(/\D/g, "")}
        onClose={() => {
          setShowOtpPopup(false);
          navigate("/");
        }}
        onSuccess={(userData, token) => {
          // ✅ Store user & token immediately so wishlist works
          login(userData, token);
          setShowOtpPopup(false);
          navigate("/"); // redirect to home or previous page
        }}
      />
    );
  }

  // ✅ Register step
  if (step === "register") {
    return (
      <Register
        mobile={String(mobile).replace(/\D/g, "")}
        onClose={() => {
          setStep("phone");
          navigate("/");
        }}
        onSuccess={(userData, token) => {
          // ✅ Store user & token immediately after registration
          login(userData, token);
          setStep("otp"); // move to OTP verification if needed
          setShowOtpPopup(true);
        }}
      />
    );
  }

  // Default: mobile input
  return (
    <div className="signin-overlay" onClick={() => navigate("/")}>
      <div className="signin-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => navigate("/")}>✕</button>

        <h2>Welcome to AJIO</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="mobile">Enter Mobile Number *</label>
          <input
            type="tel"
            id="mobile"
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            maxLength={13}
          />
          <button type="submit" className="continue-btn" disabled={loading}>
            {loading ? "Checking..." : "CONTINUE"}
          </button>
        </form>

        <p className="terms">
          By Signing In, I agree to{" "}
          <a href="/terms">Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a>
        </p>

        <div className="email-note">
          <p>
            📧 Email based login is no longer available. Please <a href="/restore">click here</a> to restore your mobile number.
          </p>
        </div>
      </div>
    </div>
  );
}
