// src/pages/VendorManagement.js
import React, { useEffect, useState } from "react";
import "../styles/VendorManagement.css";

export default function VendorRequests() {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const token = localStorage.getItem("admin_token");

  const [vendorRequests, setVendorRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const reqRes = await fetch(`${API_BASE}/api/admin/vendor-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reqData = await reqRes.json();

        const venRes = await fetch(`${API_BASE}/api/admin/vendors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const venData = await venRes.json();

        setVendorRequests(reqData || []);
        setVendors(venData || []);
      } catch (err) {
        setError("Failed to fetch vendor data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [API_BASE, token]);

  async function handleApprove(id) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/vendor-requests/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setVendorRequests((prev) => prev.filter((r) => r._id !== id));
        setVendors((prev) => [...prev, data.vendor]);
      } else {
        alert(data.message || "Failed to approve");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  }

  async function handleReject(id) {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/vendor-requests/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setVendorRequests((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert(data.message || "Failed to reject");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  }

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="vendor-management">
      <section className="card">
        <h2>Vendor Requests</h2>
        {vendorRequests.length === 0 ? (
          <p className="empty">✅ No pending requests</p>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Shop Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorRequests.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.mobile}</td>
                  <td>{r.shopName}</td>
                  <td>
                    <span className={`status ${r.status}`}>{r.status}</span>
                  </td>
                  <td>
                    <button className="btn approve" onClick={() => handleApprove(r._id)}>
                      Approve
                    </button>
                    <button className="btn reject" onClick={() => handleReject(r._id)}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h2>Approved Vendors</h2>
        {vendors.length === 0 ? (
          <p className="empty">No vendors found</p>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>GSTIN</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id}>
                  <td>{v.name}</td>
                  <td>{v.email}</td>
                  <td>{v.mobile}</td>
                  <td>{v.gstin || "-"}</td>
                  <td>
                    <span className={`status ${v.status}`}>{v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
