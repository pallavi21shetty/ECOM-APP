// src/pages/OrderDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function formatAmount(paise = 0) {
  const rupees = Number(paise) / 100;
  return rupees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatusBadge({ type = "order", value = "" }) {
  const v = (value || "").toLowerCase();
  const colors = {
    // orderStatus
    placed: "#f59e0b", // amber
    processing: "#0ea5e9", // sky
    shipped: "#7c3aed", // violet
    delivered: "#16a34a", // green
    cancelled: "#ef4444", // red
    // paymentStatus
    paid: "#16a34a",
    pending: "#f97316",
    failed: "#ef4444",
  };
  const bg = colors[v] || "#6b7280"; // gray default
  return (
    <span
      style={{
        background: bg,
        color: "white",
        padding: "4px 8px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        display: "inline-block",
        textTransform: "capitalize",
      }}
    >
      {value || "—"}
    </span>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const query = useQuery();
  const urlStatus = query.get("status"); // success/failed/cancelled/error
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printableRef = useRef();

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/payments/order/${id}`
        );
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Server error: ${res.status} ${txt}`);
        }
        const json = await res.json();
        if (json?.success) setOrder(json.order);
        else throw new Error(json?.message || "Order not found");
      } catch (err) {
        console.error("fetch order error", err);
        setError(err.message || "Unable to fetch order");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading order...</div>;
  if (error)
    return (
      <div style={{ padding: 20 }}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  if (!order) return <div style={{ padding: 20 }}>Order not found</div>;

  // Map fields (handle both possible shapes)
  const orderId = order._id || order.id;
  const orderStatus = order.orderStatus || order.status || "—";
  const paymentStatus = order.paymentStatus || "—";
  const txnId = order.transactionId || order.razorpayPaymentId || "—";
  const totalPaise = order.totalAmount ?? order.amount ?? order.total ?? 0;
  const createdAt = order.createdAt || order.created_at || null;
  const updatedAt = order.updatedAt || order.updated_at || null;

  // Items mapping
  const items = Array.isArray(order.items) ? order.items : [];

  const totalFromItems = items.reduce((s, it) => {
    const price = it.price ?? it.amount ?? 0; // paise
    const qty = it.quantity ?? it.qty ?? 1;
    return s + price * qty;
  }, 0);

  return (
    <div style={{ padding: 20, fontFamily: "Inter, Roboto, system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Order #{orderId}</h2>
          <div style={{ marginTop: 6, color: "#374151" }}>
            <small>Placed: {formatDate(createdAt)}</small>
            {updatedAt && (
              <span style={{ marginLeft: 12 }}>
                <small> • Updated: {formatDate(updatedAt)}</small>
              </span>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 6 }}>Order status</div>
            <StatusBadge value={orderStatus} />
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Payment</div>
            <StatusBadge type="payment" value={paymentStatus} />
          </div>
        </div>
      </div>

      <div ref={printableRef} style={{ marginTop: 20, background: "#fff", padding: 16, borderRadius: 8 }}>
        <section style={{ marginBottom: 18 }}>
          <h3 style={{ margin: "6px 0 10px 0" }}>Summary</h3>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#6b7280" }}>Order total</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>₹{formatAmount(totalPaise)}</div>
            </div>

            <div>
              <div style={{ color: "#6b7280" }}>Transaction ID</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <code style={{ background: "#f3f4f6", padding: "6px 8px", borderRadius: 6 }}>{txnId}</code>
                <button
                  onClick={() => {
                    if (!txnId || txnId === "—") return;
                    navigator.clipboard?.writeText(txnId);
                    alert("Transaction id copied to clipboard");
                  }}
                  style={{
                    border: "none",
                    background: "#111827",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <div style={{ color: "#6b7280" }}>Payment method</div>
              <div style={{ fontWeight: 600 }}>{(order.paymentMethod || "—").toUpperCase()}</div>
            </div>

            <div>
              <div style={{ color: "#6b7280" }}>Items total (calculated)</div>
              <div>₹{formatAmount(totalFromItems)}</div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 10 }}>
          <h4 style={{ margin: "6px 0 12px 0" }}>Items</h4>
          <div style={{ display: "grid", gap: 12 }}>
            {items.length === 0 && <div>No items found for this order.</div>}
            {items.map((it, i) => {
              // product may be populated object or just id string
              const productObj = typeof it.product === "object" ? it.product : null;
              const productId = typeof it.product === "string" ? it.product : productObj?._id || "";
              const title = it.title || productObj?.title || `Product ${productId || i + 1}`;
              const qty = it.quantity ?? it.qty ?? 1;
              const price = it.price ?? it.amount ?? 0; // paise per unit
              const subtotal = price * qty;
              const image = it.image || productObj?.image || null;

              return (
                <div key={it._id || i} style={{ display: "flex", gap: 12, padding: 12, borderRadius: 8, border: "1px solid #eef2ff", alignItems: "center" }}>
                  <div style={{ width: 90, height: 90, borderRadius: 8, overflow: "hidden", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {image ? (
                      <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ color: "#9ca3af" }}>No Image</div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{title}</div>
                        <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
                          Product: {productId || "—"} • Status: {it.status || "—"}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700 }}>₹{formatAmount(price)}</div>
                        <div style={{ color: "#6b7280", marginTop: 6 }}>Qty: {qty}</div>
                        <div style={{ marginTop: 6, fontWeight: 700 }}>Subtotal ₹{formatAmount(subtotal)}</div>
                      </div>
                    </div>

                    {/* item history */}
                    {Array.isArray(it.history) && it.history.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <details>
                          <summary style={{ cursor: "pointer", color: "#374151" }}>History ({it.history.length})</summary>
                          <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                            {it.history.map((h, idx) => (
                              <li key={idx} style={{ fontSize: 13, color: "#374151" }}>
                                <strong>{h.status}</strong> — {formatDate(h.changedAt)} {h.changedBy ? `• by ${h.changedBy}` : ""}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#6b7280" }}>Order created at {formatDate(createdAt)}</div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              style={{
                border: "1px solid #111827",
                background: "white",
                color: "#111827",
                padding: "8px 12px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Print Receipt
            </button>
            <a
              href={`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/invoice`} // optional: if you create invoice route on server
              onClick={(e) => {
                // if invoice route not implemented, prevent navigation
                if (!process.env.REACT_APP_API_URL) e.preventDefault();
              }}
              style={{
                textDecoration: "none",
                border: "none",
                background: "#111827",
                color: "white",
                padding: "8px 12px",
                borderRadius: 6,
              }}
            >
              Download Invoice
            </a>
          </div>
        </section>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
