import React, { useState, useEffect } from "react";
import AccountSidebar from "../components/AccountSidebar";
import "../styles/AddressPage.css";
import FeaturesSection from "../components/FeaturesSection";

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);

  // ✅ Load addresses from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("addresses")) || [];
    setAddresses(stored);
  }, []);

  // ✅ Delete address
  const deleteAddress = (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    localStorage.setItem("addresses", JSON.stringify(updated));
  };

  // ✅ Mark address as default
  const makeDefault = (index) => {
    const updated = addresses.map((addr, i) => ({
      ...addr,
      default: i === index, // only the clicked one becomes default
    }));
    setAddresses(updated);
    localStorage.setItem("addresses", JSON.stringify(updated));
  };

  return (
    <>
      <div className="account-page-container">
        <AccountSidebar />

        <div className="address-content">
          <h2>Address Book</h2>
          <p>Save all your addresses for a faster checkout experience.</p>

          <div className="address-grid">
            {addresses.length > 0 ? (
              addresses.map((addr, i) => (
                <div
                  key={i}
                  className={`address-card ${
                    addr.default ? "default-address" : ""
                  }`}
                >
                  <h4>
                    {addr.name}{" "}
                    {addr.default && (
                      <span className="default-tag">Default</span>
                    )}
                  </h4>
                  <span className="tag">{addr.type || "Other"}</span>

                  <p>
                    {addr.street}, {addr.landmark}
                  </p>
                  <p>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p>
                    <strong>Phone:</strong> {addr.mobile}
                  </p>

                  <div className="address-actions">
                    {!addr.default && (
                      <button onClick={() => makeDefault(i)}>
                        Set as Default
                      </button>
                    )}
                    <button onClick={() => deleteAddress(i)}>Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-address">No addresses saved yet.</div>
            )}

            {/* Placeholder for Add new address */}
            <div className="add-address-card">+ Add new address</div>
          </div>
        </div>
      </div>

      {/* Footer Features */}
      <FeaturesSection />
    </>
  );
}
