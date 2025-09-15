import React, { useEffect, useState, useMemo } from "react";
import "../styles/Orders.css";

export default function AdminOrders() {
  const API_BASE = "http://localhost:5000";
  const token = localStorage.getItem("admin_token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const statusOptions = ["placed", "processing", "shipped", "delivered", "cancelled"];
  const ORDERS_PER_PAGE = 15;

  // Fetch all paid orders with vendor notifications
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/orders/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          const paidOrders = data.filter((order) => order.paymentStatus === "paid");
          setOrders(
            [...paidOrders].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
          );
        } else {
          console.error("Error fetching orders:", data.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Update order/item status
  const updateStatus = async (orderId, itemId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/admin/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, itemId }),
      });

      const data = await res.json();
      const message = !res.ok
        ? `Failed: ${data.message}`
        : itemId
        ? `Item status updated to ${newStatus.toUpperCase()}`
        : `Order status updated to ${newStatus.toUpperCase()}`;

      const notifKey = itemId || orderId;
      setNotifications((prev) => ({ ...prev, [notifKey]: message }));

      setTimeout(() => {
        setNotifications((prev) => {
          const newNotifs = { ...prev };
          delete newNotifs[notifKey];
          return newNotifs;
        });
      }, 3000);

      if (res.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o._id === data._id ? data : o))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
      const notifKey = itemId || orderId;
      setNotifications((prev) => ({
        ...prev,
        [notifKey]: "Something went wrong while updating status.",
      }));
      setTimeout(() => {
        setNotifications((prev) => {
          const newNotifs = { ...prev };
          delete newNotifs[notifKey];
          return newNotifs;
        });
      }, 3000);
    }
  };

  // ✅ Compute counts dynamically
  const counts = useMemo(() => {
    const summary = {
      total: 0,
      placed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      order.items.forEach((item) => {
        summary.total += 1;
        if (summary[item.status] !== undefined) {
          summary[item.status] += 1;
        }
      });
    });

    return summary;
  }, [orders]);

  // ✅ Realtime filtered orders with search + statusFilter
  const filteredOrders = orders.filter((order) => {
    const lower = searchTerm.toLowerCase();

    const matchesSearch =
      !searchTerm.trim() ||
      order._id.toLowerCase().includes(lower) ||
      order.customer?.name?.toLowerCase().includes(lower) ||
      order.customer?.email?.toLowerCase().includes(lower) ||
      order.items.some((item) =>
        (item.title || item.product?.title || "").toLowerCase().includes(lower)
      );

    const matchesStatus =
      statusFilter === "all" ||
      order.items.some((item) => item.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE
  );

  if (loading) return <p className="loading">Loading orders...</p>;

  return (
    <div className="admin-orders">
      <h2>Successful Orders</h2>

      {/* ✅ Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Order ID, Item, Customer Name or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ✅ Counts under search bar with filter option */}
      <div className="order-counts">
        <div
          className={`order-count total ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => {
            setStatusFilter("all");
            setCurrentPage(1);
          }}
        >
          Total: {counts.total}
        </div>
        <div
          className={`order-count placed ${statusFilter === "placed" ? "active" : ""}`}
          onClick={() => {
            setStatusFilter("placed");
            setCurrentPage(1);
          }}
        >
          Placed: {counts.placed}
        </div>
        <div
          className={`order-count processing ${
            statusFilter === "processing" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("processing");
            setCurrentPage(1);
          }}
        >
          Processing: {counts.processing}
        </div>
        <div
          className={`order-count shipped ${statusFilter === "shipped" ? "active" : ""}`}
          onClick={() => {
            setStatusFilter("shipped");
            setCurrentPage(1);
          }}
        >
          Shipped: {counts.shipped}
        </div>
        <div
          className={`order-count delivered ${statusFilter === "delivered" ? "active" : ""}`}
          onClick={() => {
            setStatusFilter("delivered");
            setCurrentPage(1);
          }}
        >
          Delivered: {counts.delivered}
        </div>
        <div
          className={`order-count cancelled ${statusFilter === "cancelled" ? "active" : ""}`}
          onClick={() => {
            setStatusFilter("cancelled");
            setCurrentPage(1);
          }}
        >
          Cancelled: {counts.cancelled}
        </div>
      </div>

      {currentOrders.length === 0 ? (
        <p className="no-orders">No matching orders found.</p>
      ) : (
        currentOrders.map((order) => (
          <div key={order._id} className="order-card">
            {/* Header */}
            <div className="order-header">
              <h3>Order #{order._id.slice(-6)}</h3>
              <span className={`status-badge ${order.orderStatus}`}>
                {order.orderStatus.toUpperCase()}
              </span>
            </div>

            {/* Customer Info */}
            <p>
              <strong>Customer:</strong> {order.customer?.name || "Guest"} |{" "}
              <strong>Email:</strong> {order.customer?.email || "-"}
            </p>
            <p>
              <strong>Total:</strong> ₹{order.totalAmount} |{" "}
              <strong>Payment:</strong> {order.paymentStatus.toUpperCase()}
            </p>

            {/* Items */}
            <div className="items">
              <strong>Items:</strong>
              <div className="items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="item-card">
                    <img
                      src={
                        item.image ||
                        item.product?.image ||
                        "https://via.placeholder.com/80"
                      }
                      alt={item.title || item.product?.title || "Product"}
                      className="order-item-img"
                    />
                    <div className="item-details">
                      <p className="item-title">{item.title}</p>
                      <p>
                        Qty: {item.quantity} | ₹{item.price}
                      </p>
                      <p>Status: {item.status.toUpperCase()}</p>

                      {/* Update individual item status */}
                      <label htmlFor={`status-${item._id}`}>Change Status:</label>
                      <select
                        id={`status-${item._id}`}
                        value={item.status}
                        disabled={
                          item.status === "delivered" || item.status === "cancelled"
                        }
                        title={
                          item.status === "delivered" || item.status === "cancelled"
                            ? "Cannot change status after delivery or cancellation"
                            : ""
                        }
                        onChange={(e) =>
                          updateStatus(order._id, item._id, e.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>

                      {/* Item-specific notification */}
                      {notifications[item._id] && (
                        <div className="admin-notification">
                          {notifications[item._id]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Notifications */}
            {order.vendorNotifications.length > 0 && (
              <div className="vendor-notifications">
                <strong>Vendor Requests:</strong>
                {order.vendorNotifications
                  .filter((n) => !n.seenByAdmin)
                  .map((n) => (
                    <div key={n._id} className="vendor-notification-item">
                      <p>
                        Item:{" "}
                        {order.items.find((i) => i._id === n.item)?.title ||
                          "Unknown"}{" "}
                        | From: {n.oldStatus.toUpperCase()} →{" "}
                        {n.newStatus.toUpperCase()}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            {/* Order-level notification */}
            {notifications[order._id] && (
              <div className="admin-notification">{notifications[order._id]}</div>
            )}
          </div>
        ))
      )}

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              className={currentPage === idx + 1 ? "active" : ""}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
