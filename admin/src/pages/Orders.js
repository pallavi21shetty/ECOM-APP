import React, { useEffect, useState } from "react";

export default function Orders() {
  const API_BASE = "http://localhost:5000";
  const token = localStorage.getItem("admin_token");

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setOrders(data);
      } catch {
        console.error("Error fetching orders");
      }
    };
    fetchOrders();
  }, [token]);

  return (
    <>
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <div>No orders</div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o._id}</td>
                <td>{o.customerName}</td>
                <td>₹{o.total}</td>
                <td>{o.status}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
