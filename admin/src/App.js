import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import VendorRequests from "./pages/VendorManagement";
import Products from "./pages/Products";
import Orders from "./pages/Orders"

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/admin/login" />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dashboard wrapper */}
        <Route path="/admin/dashboard" element={<AdminDashboard />}>
          <Route path="vendor-requests" element={<VendorRequests />} />
           <Route path="orders" element={<Orders />} />        {/* ✅ using Orders.js */}
          <Route path="products" element={<Products />} />    {/* ✅ using Products.js */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
