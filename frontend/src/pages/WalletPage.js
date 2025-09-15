import React from "react";
import AccountSidebar from "../components/AccountSidebar";
import "../styles/WalletPage.css";
import FeaturesSection from "../components/FeaturesSection";

export default function WalletPage() {
  return (<>
    <div className="account-page-container">
        
      {/* Sidebar on the left */}
      <AccountSidebar />

      {/* Wallet content on the right */}
      <div className="wallet-content">
        <h2 className="wallet-title">AJIO Wallet</h2>
        <div className="wallet-box">
          <h3>Total Wallet Balance</h3>
          <p className="wallet-balance">₹0</p>
        </div>

        <div className="wallet-section">
          <h4>SuperCash</h4>
          <p>
            Earned from promotions & offers at AJIO with limited validity. Use
            upto 100%* on every purchase.
          </p>
          <span className="amount">₹0</span>
        </div>

        <div className="wallet-section">
          <h4>Cash</h4>
          <p>
            Earned from return of AJIO orders when paid using cash at the time
            of delivery.
          </p>
          <span className="amount">₹0</span>
        </div>

        <div className="wallet-section">
          <h4>Have a Gift Card?</h4>
          <p>Add to AJIO Wallet to pay for your orders.</p>
          <a href="/" className="wallet-link">Check balance</a> |{" "}
          <a href="/" className="wallet-link">Add</a>
        </div>

        <div className="wallet-section">
          <h4>Spending History</h4>
        </div>

        <div className="wallet-section">
          <h4>Frequently Asked Questions</h4>
        </div>
      </div>
        
    </div>
     <FeaturesSection />
     </>
  );
}
