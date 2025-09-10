// frontend/src/components/Otp.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ import AuthContext
import "../styles/Register.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const MAX_ATTEMPTS = 3;
const BLOCK_MS = 3000;

const Otp = ({ mobile, onClose, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [blocked, setBlocked] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ get login function from context

  useEffect(() => {
    setStatus("");
    setOtp("");
    setAttemptsLeft(MAX_ATTEMPTS);
    setBlocked(false);
  }, [mobile]);

  const handleVerify = async () => {
    if (!otp || otp.trim().length === 0) {
      setStatus("Please enter OTP");
      return;
    }
    if (blocked) {
      setStatus("Temporarily blocked. Please wait.");
      return;
    }

    try {
      setVerifyLoading(true);
      const res = await axios.post(`${API}/api/auth/verify-otp`, {
        mobile,
        otp: String(otp).trim(),
      });
      setVerifyLoading(false);

      const data = res.data || {};

      if (data.success) {
        // ✅ Login user via context
        if (data.token && data.user) {
          login(data.user, data.token); // store token & user in context/localStorage
          if (onSuccess) onSuccess(data.user, data.token); // emit success callback if provided
        }

        setStatus("Login successful!");
        onClose && onClose();

        navigate("/"); // redirect to home page
        return;
      } else {
        setStatus(data.message || "Invalid OTP");
      }
    } catch (err) {
      setVerifyLoading(false);
      const resp = err?.response?.data;
      const message = resp?.message || err.message || "Error verifying OTP";
      setStatus(message);

      // Handle attempts and block
      if (resp?.attemptsLeft !== undefined) {
        setAttemptsLeft(resp.attemptsLeft);
      } else {
        setAttemptsLeft((prev) => {
          const next = Math.max(0, prev - 1);
          if (next === 0) {
            setBlocked(true);
            setStatus("OTP limit over — temporarily blocked");
            setTimeout(() => {
              setBlocked(false);
              setAttemptsLeft(MAX_ATTEMPTS);
              setStatus("");
            }, BLOCK_MS);
          }
          return next;
        });
      }

      if (resp?.blockedUntil) {
        const unblockIn = new Date(resp.blockedUntil).getTime() - Date.now();
        if (unblockIn > 0) {
          setBlocked(true);
          setStatus("OTP limit over — temporarily blocked");
          setTimeout(() => {
            setBlocked(false);
            setAttemptsLeft(MAX_ATTEMPTS);
            setStatus("");
          }, unblockIn);
        }
      }
    }
  };

  const handleResend = async () => {
    if (blocked) {
      setStatus("Temporarily blocked. Please wait before resending.");
      return;
    }

    try {
      setResendLoading(true);
      const res = await axios.post(`${API}/api/auth/send-otp`, { mobile });
      setResendLoading(false);

      const data = res.data || {};
      if (data.success) {
        setStatus(data.message || "OTP resent");
        setAttemptsLeft(MAX_ATTEMPTS);
        setBlocked(false);

        if (data.otp) {
          alert(`Dev OTP: ${data.otp}`);
          console.log("Dev OTP:", data.otp);
        }
      } else {
        setStatus(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setResendLoading(false);
      const message = err?.response?.data?.message || "Error resending OTP";
      setStatus(message);
    }
  };

  return (
    <div className="register-popup">
      <div className="register-box">
        <button
          className="close-btn"
          onClick={onClose}
          disabled={verifyLoading || resendLoading}
        >
          ×
        </button>

        <h2>Sign In with OTP</h2>
        <p>
          Enter OTP sent to <strong>{mobile}</strong>
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={blocked}
          maxLength={6}
          style={{ textAlign: "center", fontSize: "1.1rem" }}
        />

        <button
          className="submit-btn"
          onClick={handleVerify}
          disabled={blocked || verifyLoading}
        >
          {verifyLoading ? "Verifying..." : "START SHOPPING"}
        </button>

        <button
          className="submit-btn"
          style={{ marginTop: "10px", background: "#555" }}
          onClick={handleResend}
          disabled={blocked || resendLoading}
        >
          {resendLoading ? "Resending..." : "Resend OTP"}
        </button>

        <div style={{ marginTop: 12, minHeight: 36 }}>
          {status && <p style={{ color: "red", margin: 6 }}>{status}</p>}
          <p style={{ margin: 6 }}>
            Attempts left: <strong>{attemptsLeft}</strong>
          </p>
          {blocked && (
            <p style={{ color: "orange" }}>
              Temporarily blocked — please wait
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Otp;
