// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import VendorAuth from "./pages/VendorAuth";
import VendorDashboard from "./pages/VendorDashboard";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import Products from "./pages/Products";
import Orders from "./pages/Orders";

export default function App() {
  const [vendor, setVendor] = useState(null);

  const handleLoginSuccess = (vendorData) => {
    setVendor(vendorData);
  };

  const handleLogout = () => {
    localStorage.removeItem("vendor_token");
    setVendor(null);
  };

  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={
            vendor ? (
              <Navigate to="/vendor/dashboard" replace />
            ) : (
              <VendorAuth onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Vendor Dashboard (layout) */}
        <Route
          path="/vendor"
          element={
            vendor ? (
              <VendorDashboard vendor={vendor} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route path="dashboard" element={<VendorDashboardPage />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
    </Router>
  );
}
