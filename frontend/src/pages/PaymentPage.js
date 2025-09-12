// src/pages/PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { useAuth } from "../context/AuthContext";

export default function PaymentPage() {
  const FRONTEND_BASE = process.env.REACT_APP_FRONTEND_BASE || "http://localhost:3000";
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const USE_REDIRECT_FLOW = (process.env.REACT_APP_RAZORPAY_USE_REDIRECT || "false").toLowerCase() === "true";

  const location = useLocation();
  const navigate = useNavigate();
  const { cart, orderTotal, address } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const { user } = useAuth();

  // guard: if user landed here without order data, redirect back to cart
  useEffect(() => {
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      navigate("/cart");
    }
  }, [cart, navigate]);

  useEffect(() => {
    // Preload Razorpay SDK early for snappier UI
    loadRazorpayScript()
      .then(() => setSdkLoaded(true))
      .catch((err) => {
        console.error("Razorpay SDK failed to load:", err);
        setSdkLoaded(false);
      });
  }, []);

  // convert rupees to paise (orderTotal likely in rupees)
  function toPaise(amountRupees) {
    // ensure integer paise
    return Math.round(Number(amountRupees) * 100);
  }

  async function handlePay() {
    if (loading) return;
    setLoading(true);

    try {
      // Make sure SDK is loaded (try to load if not)
      if (!window.Razorpay) {
        await loadRazorpayScript();
        if (!window.Razorpay) throw new Error("Razorpay SDK did not load");
      }

      // prepare minimal items snapshot for server (server should also validate)
      const itemsSnapshot = (cart || []).map((it) => ({
        product: it.product?._id || it.productId || null,
        title: it.title || it.product?.title || "Item",
        quantity: it.quantity ?? it.qty ?? it.qty ?? 1,
        price: Math.round((it.price ?? 0) * 100), // paise snapshot per unit
      }));

      // Build payload. If using redirect flow, we ask server to include a callback_url (server decides actual URL)
      const payload = {
        amount: toPaise(orderTotal), // paise
        currency: "INR",
        items: itemsSnapshot,
        userId: user?._id || user?.id || null,
        useRedirect: USE_REDIRECT_FLOW, // optional flag server can use to decide whether to set callback_url
      };

      // Create order on server - gets Razorpay order_id + local order ID
      const resp = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Create order failed: ${resp.status} ${txt}`);
      }

      const data = await resp.json();
      if (!data?.razorpayOrder || !data?.localOrderId) {
        throw new Error("Create order returned invalid response");
      }

      const rOrder = data.razorpayOrder;
      const localOrderId = data.localOrderId;

      // Build Razorpay checkout options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: rOrder.amount,
        currency: rOrder.currency,
        name: "AJIO",
        description: `Order • ${localOrderId}`,
        image: "https://assets.ajio.com/static/img/Ajio-Logo.svg",
        order_id: rOrder.id,
        prefill: {
          name: address?.name || user?.name || "",
          email: user?.email || "",
          contact: address?.mobile || user?.mobile || "",
        },
        notes: {
          localOrderId,
        },
        modal: {
          // when modal dismissed, treat as cancelled and navigate to order page
          ondismiss: function () {
            window.location.href = `${FRONTEND_BASE}/orders/${localOrderId}?status=cancelled`;
          },
        },
      };

      // Two flows:
      // 1) Modal flow (default): use handler + verify-payment endpoint on server
      // 2) Redirect flow: server sets callback_url when creating order -> Razorpay will redirect to server after payment.
      if (!USE_REDIRECT_FLOW) {
        options.handler = async function (response) {
          // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
          try {
            const verifyResp = await fetch(`${API_BASE}/api/payments/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                localOrderId,
              }),
              credentials: "include",
            });

            const verifyJson = await verifyResp.json();
            if (verifyJson.success) {
              window.location.href = `${FRONTEND_BASE}/orders/${localOrderId}?status=success`;
            } else {
              window.location.href = `${FRONTEND_BASE}/orders/${localOrderId}?status=failed`;
            }
          } catch (err) {
            console.error("Verification error:", err);
            window.location.href = `${FRONTEND_BASE}/orders/${localOrderId}?status=error`;
          }
        };
      } else {
        // If using redirect flow, optional: let Razorpay redirect to server callback URL which will redirect to frontend.
        // Server should have set callback_url when creating the order (createOrder should set it when useRedirect true).
        // Still keep modal.ondismiss as above.
      }

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (resp) {
        console.error("payment.failed:", resp);
        window.location.href = `${FRONTEND_BASE}/orders/${localOrderId}?status=failed`;
      });

      // Open checkout (same-window modal). For redirect flow Razorpay will perform redirect after payment.
      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      alert("Could not start payment: " + (err.message || err));
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, marginTop: 120 }}>
      <h2>Review & Pay</h2>

      <div style={{ marginBottom: 16 }}>
        <p>
          <strong>Deliver to:</strong>{" "}
          {address ? `${address.name}, ${address.city} - ${address.pincode}` : "No address"}
        </p>
        <p>
          <strong>Amount:</strong> ₹{orderTotal?.toFixed?.(2) ?? "0.00"}
        </p>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={handlePay}
          disabled={loading || !sdkLoaded}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            background: sdkLoaded ? "#111827" : "#9ca3af",
            color: "white",
            border: "none",
            cursor: loading || !sdkLoaded ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Starting payment..." : `Pay ₹${orderTotal?.toFixed?.(2) ?? "0.00"}`}
        </button>

        <button
          onClick={() => navigate("/shipping")}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            background: "white",
            color: "#111827",
            border: "1px solid #e5e7eb",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Back
        </button>
      </div>

      {!sdkLoaded && (
        <div style={{ marginTop: 12, color: "#b91c1c" }}>
          Razorpay SDK not loaded yet. The checkout button will work once the SDK finishes loading.
        </div>
      )}

      <div style={{ marginTop: 10, color: "#6b7280", fontSize: 13 }}>
        <div>Payment mode: {USE_REDIRECT_FLOW ? "Redirect (callback_url) flow" : "Modal (in-page) flow"}</div>
        <div style={{ marginTop: 6 }}>
          Note: For redirect flow your server should set `callback_url` when creating the Razorpay order so the gateway redirects to your server after payment.
        </div>
      </div>
    </div>
  );
}
