import React from "react";
import { FaShoppingBag, FaHeart, FaStar } from "react-icons/fa";
import "../styles/FeaturesSection.css";

export default function FeaturesSection() {
  return (
    <div className="features-section">
      <div className="wishlist-icons">
        <div>
          <FaShoppingBag size={30} />
          <p>Easy Exchange</p>
        </div>
        <div>
          <FaHeart size={30} />
          <p>100% Handpicked</p>
        </div>
        <div>
          <FaStar size={30} />
          <p>Assured Quality</p>
        </div>
      </div>
    </div>
  );
}
