import React, { useEffect, useState } from "react";
import AccountSidebar from "../components/AccountSidebar";
import "../styles/PaymentsPage.css";
import FeaturesSection from "../components/FeaturesSection";

export default function PaymentsPage() {
  const [cards, setCards] = useState([]);

  // ✅ Load saved cards from localStorage (you can add them via checkout page)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("savedCards")) || [];
    setCards(stored);
  }, []);

  // ✅ Delete card
  const deleteCard = (index) => {
    const updated = cards.filter((_, i) => i !== index);
    setCards(updated);
    localStorage.setItem("savedCards", JSON.stringify(updated));
  };

  return (
    <>
    <div className="account-page-container">
      <AccountSidebar />

      <div className="payments-content">
        <h2>Payments</h2>
        <p>View and edit your payment modes</p>

        <div className="payments-section">
          <h3>My Saved Card</h3>

          {cards.length > 0 ? (
            <div className="card-list">
              {cards.map((card, i) => (
                <div key={i} className="card-item">
                  <p>
                    <strong>{card.nameOnCard}</strong>
                  </p>
                  <p>**** **** **** {card.last4}</p>
                  <p>Expiry: {card.expiry}</p>
                  <button onClick={() => deleteCard(i)}>Delete</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-cards">No saved cards yet.</p>
          )}
        </div>
      </div>
    </div>
    <FeaturesSection/>
    </>
  );
}
