// src/pages/AdminDashboard.js
import React from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import VendorRequests from "./VendorManagement";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  function logoutAdmin() {
    localStorage.removeItem("admin_token"); // remove token
    navigate("/admin/login"); // redirect to login
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Admin Panel</h2>
        <nav>
          <ul>
            <li>
              <Link to="vendor-requests">Vendor Management</Link>
            </li>
            <li>
              <Link to="orders">Orders</Link>
            </li>
            <li>
              <Link to="products">Products</Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="content">
        <header className="header">
          <h1>Admin Dashboard</h1>
          <button className="logout-btn" onClick={logoutAdmin}>
            Logout
          </button>
        </header>
        <section className="page-content">
          <Routes>
            <Route path="vendor-requests" element={<VendorRequests />} />
            <Route path="orders" element={<div>📦 Orders Page</div>} />
            <Route path="products" element={<div>🛍️ Products Page</div>} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
