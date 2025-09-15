// src/pages/VendorOrdersPage.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/Orders.css";

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [notifications, setNotifications] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const ordersPerPage = 15; // ✅ show only 15 per page
  const vendorAllowedStatuses = ["placed", "processing", "shipped", "cancelled"];

  // Fetch vendor orders
  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem("vendor_token");
      if (!token) throw new Error("Vendor not logged in");

      const { data } = await axios.get(
        "http://localhost:5000/api/orders/vendor",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(data);
    } catch (err) {
      console.error("Error fetching vendor orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update item status
  const updateItemStatus = async (orderId, itemId, status) => {
    try {
      setUpdatingItem(itemId);
      const token = localStorage.getItem("vendor_token");

      const { data } = await axios.put(
        `http://localhost:5000/api/orders/vendor/${orderId}/item/${itemId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) => ({
        ...prev,
        [itemId]: { type: "success", message: data.message },
      }));

      setTimeout(() => {
        setNotifications((prev) => {
          const newNotifs = { ...prev };
          delete newNotifs[itemId];
          return newNotifs;
        });
      }, 3000);

      await fetchOrders();
    } catch (err) {
      console.error("Error updating item status:", err);
      const message =
        err.response?.data?.message || "Failed to update status";

      setNotifications((prev) => ({
        ...prev,
        [itemId]: { type: "error", message },
      }));

      setTimeout(() => {
        setNotifications((prev) => {
          const newNotifs = { ...prev };
          delete newNotifs[itemId];
          return newNotifs;
        });
      }, 3000);
    } finally {
      setUpdatingItem(null);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) return <div>Loading orders...</div>;

  // ✅ Count items by status
  const counts = { placed: 0, processing: 0, shipped: 0, cancelled: 0 };
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
    });
  });

  // ✅ Filter orders by search + status
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      order._id.toLowerCase().includes(query) ||
      order.customer?.name?.toLowerCase().includes(query) ||
      order.items.some((item) =>
        (item.title || item.product?.title || "")
          .toLowerCase()
          .includes(query)
      );

    const matchesStatus =
      statusFilter === "all" ||
      order.items.some((item) => item.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ordersPerPage
  );

  return (
    <div className="vendor-orders-container">
      <h2>Vendor Orders</h2>

      {/* ✅ Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Order ID, Customer, or Item..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // reset page when searching
          }}
        />
      </div>

      {/* ✅ Status Counts + Filter */}
      <div className="order-counts">
        <div
          className={`count-card all ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => {
            setStatusFilter("all");
            setCurrentPage(1);
          }}
        >
          <h4>{orders.reduce((acc, o) => acc + o.items.length, 0)}</h4>
          <p>All</p>
        </div>
        <div
          className={`count-card placed ${
            statusFilter === "placed" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("placed");
            setCurrentPage(1);
          }}
        >
          <h4>{counts.placed}</h4>
          <p>Placed</p>
        </div>
        <div
          className={`count-card processing ${
            statusFilter === "processing" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("processing");
            setCurrentPage(1);
          }}
        >
          <h4>{counts.processing}</h4>
          <p>Processing</p>
        </div>
        <div
          className={`count-card shipped ${
            statusFilter === "shipped" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("shipped");
            setCurrentPage(1);
          }}
        >
          <h4>{counts.shipped}</h4>
          <p>Shipped</p>
        </div>
        <div
          className={`count-card cancelled ${
            statusFilter === "cancelled" ? "active" : ""
          }`}
          onClick={() => {
            setStatusFilter("cancelled");
            setCurrentPage(1);
          }}
        >
          <h4>{counts.cancelled}</h4>
          <p>Cancelled</p>
        </div>
      </div>

      {/* ✅ Orders List */}
      {paginatedOrders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        paginatedOrders.map((order) => (
          <div key={order._id} className="vendor-order-card">
            <div className="order-header">
              <h4>Order #{order._id.slice(-6)}</h4>
              <p>Customer: {order.customer?.name || "Unknown"}</p>
              <p>Total: ₹{order.totalAmount}</p>
              <p>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="order-items">
              {order.items.map((item) => {
                const isDisabled = !vendorAllowedStatuses.includes(item.status);

                return (
                  <div key={item._id} className="order-item">
                    <img
                      src={item.image || item.product?.image}
                      alt={item.title || "Product"}
                      className="order-item-img"
                    />
                    <div className="order-item-details">
                      <h4>{item.title || item.product?.title}</h4>
                      <p>Qty: {item.quantity}</p>
                      <p>₹{item.price}</p>
                      <p>Status: {item.status.toUpperCase()}</p>

                      <select
                        value={item.status}
                        disabled={updatingItem === item._id || isDisabled}
                        title={
                          isDisabled
                            ? "Cannot change status after shipped or delivered"
                            : ""
                        }
                        onChange={(e) =>
                          updateItemStatus(order._id, item._id, e.target.value)
                        }
                      >
                        {vendorAllowedStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.toUpperCase()}
                          </option>
                        ))}
                      </select>

                      {notifications[item._id] && (
                        <div
                          className={`vendor-notification ${
                            notifications[item._id].type === "success"
                              ? "success"
                              : "error"
                          }`}
                        >
                          {notifications[item._id].message}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
