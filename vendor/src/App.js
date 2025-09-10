// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import VendorAuth from "./pages/VendorAuth";
import VendorDashboard from "./pages/VendorDashboard";
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
        {/* Default route → if vendor logged in, go to dashboard, else login/register */}
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

        {/* Vendor Dashboard (protected) */}
        <Route
          path="/vendor/dashboard"
          element={
            vendor ? (
              <VendorDashboard vendor={vendor} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Vendor Products page */}
        <Route
          path="/vendor/products"
          element={vendor ? <Products /> : <Navigate to="/" replace />}
        />

        {/* Vendor Orders page */}
        <Route
          path="/vendor/orders"
          element={vendor ? <Orders /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}
