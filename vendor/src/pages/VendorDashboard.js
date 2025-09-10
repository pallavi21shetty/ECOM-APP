import React from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, LogOut } from "lucide-react"; // ✅ nice icons
import "../styles/VendorDashboard.css";

export default function VendorDashboard({ vendor, onLogout }) {
  return (
    <div className="vendor-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">🛍️ Vendor Panel</h2>
        <nav>
          <ul>
            <li>
              <Link to="/vendor/products">
                <Package className="icon" /> Products
              </Link>
            </li>
            <li>
              <Link to="/vendor/orders">
                <ShoppingCart className="icon" /> Orders
              </Link>
            </li>
          </ul>
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut className="icon" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="content">
        <header className="header">
          <h1>Welcome, {vendor.name}</h1>
        </header>
        <section className="page-content">
          <p> Manage your shop by selecting an option from the sidebar.</p>
        </section>
      </main>
    </div>
  );
}
