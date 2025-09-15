import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/AccountSidebar.css";

export default function AccountSidebar() {
  const location = useLocation();

  return (
      <aside className="my-orders-sidebar">
      <h3>My Account</h3>
      <ul>
        <li className={location.pathname === "/my-orders" ? "active" : ""}>
          <Link to="/account/orders">Orders</Link>
        </li>
        <li className={location.pathname === "/wallet" ? "active" : ""}>
          <Link to="/account/wallet">AJIO Wallet</Link>
        </li>
        <li className={location.pathname === "/invite" ? "active" : ""}>
          <Link to="/account/invite">Invite Friends</Link>
        </li>
        <li className={location.pathname === "/rewards" ? "active" : ""}>
          <Link to="/account/rewards">My Rewards</Link>
        </li>
        <li className={location.pathname === "/support" ? "active" : ""}>
          <Link to="https://www.ajio.com/selfcare">Customer Care</Link>
        </li>
      </ul>
    
      <h3>Profile</h3>
      <ul>
        <li className={location.pathname === "/profile" ? "active" : ""}>
          <Link to="/account/profile">Personal Information</Link>
        </li>
        <li className={location.pathname === "/address" ? "active" : ""}>
          <Link to="/account/address">Address Book</Link>
        </li>
        <li className={location.pathname === "/payments" ? "active" : ""}>
          <Link to="/account/payments">Payments</Link>
        </li>
      </ul>
    </aside>
    
  );
}
