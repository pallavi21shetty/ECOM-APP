import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MyOrdersPage.css";
import AccountSidebar from "../components/AccountSidebar"; 

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const statusFlow = ["placed", "processing", "shipped", "delivered", "cancelled"];



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

    const interval = setInterval(fetchOrders, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch single order tracking details
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

  if (loading) return <div className="orders-loading">Loading...</div>;

  return (
    <div className="my-orders-container">
     < AccountSidebar/>
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

                        {/* Item-level progress
                        <div className="item-progress-bar">
                          {statusFlow.map((status, idx) => (
                            <span
                              key={idx}
                              className={`progress-step ${
                                status === item.status ||
                                statusFlow.indexOf(status) < statusFlow.indexOf(item.status)
                                  ? "active"
                                  : ""
                              }`}
                            >
                              {status.toUpperCase()}
                            </span>
                          ))}
                        </div> */}
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

                      <div className="progress-bar">
                        {statusFlow.map((status, i) => (
                          <div
                            key={i}
                            className={`progress-step ${
                              status === item.status ||
                              statusFlow.indexOf(status) < statusFlow.indexOf(item.status)
                                ? "active"
                                : ""
                            }`}
                          >
                            {status.toUpperCase()}
                          </div>
                        ))}
                      </div>

                      <ul className="tracking-history">
                        {(item.history || []).map((h, i) => (
                          <li key={i}>
                            {h.status.toUpperCase()} — {new Date(h.changedAt).toLocaleString()} (
                            {h.changedBy})
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
