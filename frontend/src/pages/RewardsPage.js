import React from "react";
import AccountSidebar from "../components/AccountSidebar";
import "../styles/RewardsPage.css";
import FeaturesSection from "../components/FeaturesSection";

export default function RewardsPage() {
  return (
    <>
    <div className="account-page-container">
      {/* Sidebar */}
      <AccountSidebar />

      {/* Rewards Content */}
      <div className="rewards-content">
        <h2 className="rewards-title">My Rewards</h2>
        <div className="rewards-box">
          <p className="rewards-empty">You have no rewards yet, start playing!</p>
        </div>
      </div>
    </div>
     <FeaturesSection />
     </>
  );
}
