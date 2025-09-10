import React, { useState } from "react";
import "../styles/VendorDashboard.css";

export default function Orders() {
  const [orders] = useState([
    { id: 101, items: "2x Product A", status: "Pending" },
    { id: 102, items: "1x Product B", status: "Shipped" },
  ]);

  return (
    <section className="orders-section">
      <h2>View Orders</h2>
      <ul className="order-list">
        {orders.map((o) => (
          <li key={o.id}>
            <div>
              <strong>Order #{o.id}</strong> - {o.items}
            </div>
            <span>Status: {o.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
