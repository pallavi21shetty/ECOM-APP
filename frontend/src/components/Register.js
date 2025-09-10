// frontend/src/components/Register.js
import React, { useState } from "react";
import axios from "axios";
import Otp from "./Otp";
import { useAuth } from "../context/AuthContext"; // ✅ import AuthContext
import "../styles/Register.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Register = ({ onClose, mobile }) => {
  const [formData, setFormData] = useState({
    mobile: mobile || "",
    name: "",
    email: "",
    gender: "",
    role: "User",
    inviteCode: "",
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form"); // form | otp
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { login } = useAuth(); // ✅ AuthContext login

  const mobileRegex = /^[6-9]\d{9}$/;
  const emailRegex =
    /^[A-Za-z]+[0-9]{0,3}[A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const nameRegex = /^[A-Za-z ]+$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    const normalizedMobile = String(formData.mobile).replace(/\D/g, "");

    if (!mobileRegex.test(normalizedMobile)) {
      newErrors.mobile =
        "Mobile must start with 6/7/8/9 and be exactly 10 digits.";
    }

    if (!emailRegex.test(formData.email)) {
      newErrors.email =
        "Email must be valid and start with letters (can include up to 3 digits after letters).";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (!nameRegex.test(formData.name.trim())) {
      newErrors.name = "Name must contain only alphabets and spaces.";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select gender.";
    }

    setErrors(newErrors);
    return { ok: Object.keys(newErrors).length === 0, normalizedMobile };
  };

  const tryPostEndpoints = async (payload) => {
    const endpoints = [
      `${API}/api/auth/register`,
      `${API}/api/auth/signup`,
      `${API}/signup`,
      `${API}/register`,
    ];

    let lastError = null;
    for (const url of endpoints) {
      try {
        const res = await axios.post(url, payload, { timeout: 8000 });
        return res;
      } catch (err) {
        const status = err?.response?.status;
        lastError = err;
        if (status === 404) continue;
        else throw err;
      }
    }
    throw lastError || new Error("No endpoints available");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});
    const { ok, normalizedMobile } = validate();
    if (!ok) return;

    const payload = {
      ...formData,
      mobile: normalizedMobile,
      phone: normalizedMobile,
    };

    setLoading(true);
    try {
      const res = await tryPostEndpoints(payload);
      setLoading(false);

      const data = res?.data || {};

      const success =
        data.success === true ||
        data.status === "otp_sent" ||
        data.status === "existing" ||
        data.status === "new";

      if (success) {
        // Open OTP step if backend generated OTP
        if (data.status === "otp_sent" || data.status === "existing" || data.otp) {
          setStep("otp");
          setShowOtp(true);
          if (data.otp) {
            alert(`Dev OTP: ${data.otp}`);
            console.log("Dev OTP:", data.otp);
          }
        } else {
          setStep("otp");
          setShowOtp(true);
          setMessage(data.message || "Registered. Please enter OTP (or click Resend).");
        }
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      setLoading(false);
      console.error("Register error:", err);
      const resp = err?.response?.data;
      const serverMsg =
        resp?.message || resp?.error || err.message || "Server error during registration";
      setMessage(serverMsg);
    }
  };

  if (step === "otp" && showOtp) {
    return (
      <Otp
        mobile={formData.mobile}
        onClose={() => {
          setShowOtp(false);
          onClose && onClose();
        }}
        onSuccess={(user, token) => {
          // ✅ Auto login after OTP verification
          login(user, token);
        }}
      />
    );
  }

  return (
    <div className="register-popup">
      <div className="register-box">
        <button className="close-btn" onClick={onClose} disabled={loading}>
          ×
        </button>
        <h2>Welcome to AJIO</h2>
        <p>Please set up your account</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
            maxLength={13}
          />
          {errors.mobile && <p className="error">{errors.mobile}</p>}

          <div className="gender">
            <label>
              <input
                type="radio"
                name="gender"
                value="Female"
                onChange={handleChange}
                checked={formData.gender === "Female"}
              />{" "}
              Female
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                onChange={handleChange}
                checked={formData.gender === "Male"}
              />{" "}
              Male
            </label>
          </div>
          {errors.gender && <p className="error">{errors.gender}</p>}

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <p className="error">{errors.name}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
            <option value="Vendor">Vendor</option>
          </select>

          <input
            type="text"
            name="inviteCode"
            placeholder="Invite Code (Optional)"
            value={formData.inviteCode}
            onChange={handleChange}
          />

          <label style={{ display: "block", marginTop: 8 }}>
            <input type="checkbox" required /> By Signing Up, I agree to Terms
            and Conditions
          </label>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
            style={{ marginTop: 12 }}
          >
            {loading ? "Sending..." : "SEND OTP"}
          </button>
        </form>

        {message && <p className="error" style={{ marginTop: 12 }}>{message}</p>}
      </div>
    </div>
  );
};

export default Register;
