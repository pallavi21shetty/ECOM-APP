import React, { useState } from "react";
import AccountSidebar from "../components/AccountSidebar";
import "../styles/InvitePage.css";
import FeaturesSection from "../components/FeaturesSection";

export default function InvitePage() {
  const [copied, setCopied] = useState(false);

  // ✅ Example referral link (could be dynamic if you generate per user)
  const referralLink = "https://yourshop.com/referral?code=FRIEND100";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    <div className="account-page-container">
      <AccountSidebar />

      <div className="invite-content">
        <h2>Invite Friends</h2>
        <p>Invite your friends and earn exciting rewards!</p>

        <div className="invite-box">
          <p><strong>Your Referral Link:</strong></p>
          <div className="referral-container">
            <input type="text" value={referralLink} readOnly />
            <button onClick={copyToClipboard}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <p className="share-text">Or share via:</p>
          <div className="share-buttons">
            <a
              href={`mailto:?subject=Join me on OurShop&body=Sign up using my referral link: ${referralLink}`}
              className="email-btn"
            >
              Share via Email
            </a>
          </div>
        </div>
      </div>
    </div>
    <FeaturesSection/>
    </>
  );
}
