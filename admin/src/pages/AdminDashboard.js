import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  function logoutAdmin() {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
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
           {/* Main Content */}
        {/* Outlet renders child routes */}
        <section className="page-content">
          <Outlet />
        </section>
      </main>
      
    </div>
  );
}
