import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MyOrdersPage.css";
import AccountSidebar from "../components/AccountSidebar";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // return modal state
  // const [ setShowReturnModal] = useState(false);
  // const [ setReturnReason] = useState("");
  // const [ setSelectedItem] = useState(null);

  const statusFlow = ["placed", "processing", "shipped", "delivered", "cancelled", "returned"];

  // Fetch user's orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/orders/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Cancel item
  const cancelItem = async (orderId, itemId) => {
    const reason = window.prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/cancel/${orderId}/${itemId}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchOrders();
    } catch (err) {
      console.error("Error cancelling item:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Open return modal
  // const openReturnModal = (orderId, itemId) => {
  //   setSelectedItem({ orderId, itemId });
  //   setReturnReason("");
  //   setShowReturnModal(true);
  // };

  // // Submit return request with reason
  // const submitReturn = async () => {
  //   if (!returnReason.trim()) {
  //     alert("Please provide a reason for return.");
  //     return;
  //   }

  //   setActionLoading(true);
  //   try {
  //     const token = localStorage.getItem("token");
  //      console.log("➡️ Sending return request", selectedItem, returnReason);
  //     await axios.put(
  //       `http://localhost:5000/api/orders/return/${selectedItem.orderId}/${selectedItem.itemId}`,
  //       { reason: returnReason },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setShowReturnModal(false);
  //     await fetchOrders();
  //     alert("Your return has been initiated. Refund will be processed shortly.");
  //   } catch (err) {
  //     console.error("Error returning item:", err);
  //   } finally {
  //     setActionLoading(false);
  //   }
  // };

  // Track order
  const trackOrder = async (orderId) => {
    setTrackingLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:5000/api/orders/track/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrackingOrder(data);
    } catch (err) {
      console.error("Error fetching tracking details:", err);
    } finally {
      setTrackingLoading(false);
    }
  };

  const closeTracking = () => setTrackingOrder(null);

  // Progress step logic fix
  const renderProgressBar = (item) => {
    return (
      <div className="progress-bar">
        {statusFlow.map((status, i) => {
          let isActive = false;

          if (item.status === "cancelled") {
            // only cancelled lights up
            isActive = status === "cancelled";
          } else if (item.status === "returned") {
            // delivered + returned light up
            isActive = status === "delivered" || status === "returned";
          } else {
            // normal flow
            isActive = statusFlow.indexOf(status) <= statusFlow.indexOf(item.status);
          }

          return (
            <div key={i} className={`progress-step ${isActive ? "active" : ""}`}>
              {status.toUpperCase()}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <div className="orders-loading">Loading...</div>;

  return (
    <div className="my-orders-container">
      <AccountSidebar />
      <main className="my-orders-content">
        <h2>My Orders</h2>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders placed</p>
            <div className="wishlist-suggestion">
              <button className="wishlist-btn">ADD FROM WISHLIST</button>
            </div>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h4>Order ID: {order._id.slice(-6)}</h4>
                  <p>Status: {order.orderStatus.toUpperCase()}</p>
                  <p>Total: ₹{order.totalAmount}</p>
                  <p>Placed On: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="order-items">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item">
                      <img
                        src={item.image || item.product?.image || "https://via.placeholder.com/80"}
                        alt={item.title || item.product?.title || "Product"}
                        className="order-item-img"
                      />
                      <div className="order-item-details">
                        <h4>{item.title || "Product"}</h4>
                        <p>Qty: {item.quantity}</p>
                        <p>₹{item.price}</p>
                        <p>Status: {item.status.toUpperCase()}</p>

                        {/* Cancel button */}
                        {["placed", "processing"].includes(item.status) && (
                          <button
                            className="cancel-btn"
                            onClick={() => cancelItem(order._id, item._id)}
                            disabled={actionLoading}
                          >
                            {actionLoading ? "Processing..." : "Cancel Item"}
                          </button>
                        )}

                        {/* Return button */}
                        {/* {item.status === "delivered" && (
                          <button
                            className="return-btn"
                            onClick={() => openReturnModal(order._id, item._id)}
                            disabled={actionLoading}
                          >
                            Return Item
                          </button>
                        )} */}

                        {/* Progress bar */}
                        {/* {renderProgressBar(item)} */}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-actions">
                  <button className="track-order-btn" onClick={() => trackOrder(order._id)}>
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Return Modal */}
        {/* {showReturnModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Return Reason</h3>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Please provide your reason for return"
              />
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowReturnModal(false)}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={submitReturn} disabled={actionLoading}>
                  {actionLoading ? "Submitting..." : "Submit Return"}
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Tracking Modal */}
        {trackingOrder && (
          <div className="tracking-modal">
            <div className="tracking-content">
              <button className="close-btn" onClick={closeTracking}>
                &times;
              </button>
              <h3>Tracking for Order #{trackingOrder._id.slice(-6)}</h3>

              {trackingLoading ? (
                <p>Loading tracking details...</p>
              ) : (
                <div className="tracking-items">
                  {trackingOrder.items.map((item, idx) => (
                    <div key={idx} className="tracking-item">
                      <div className="tracking-item-header">
                        <img
                          src={item.image || item.product?.image || "https://via.placeholder.com/60"}
                          alt={item.title || item.product?.title || "Product"}
                        />
                        <h4>{item.title}</h4>
                      </div>

                      {renderProgressBar(item)}

                      <ul className="tracking-history">
                        {(item.history || []).map((h, i) => (
                          <li key={i}>
                            {h.status.toUpperCase()} — {new Date(h.changedAt).toLocaleString()} (
                            {h.changedBy}) {h.reason ? `Reason: ${h.reason}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
