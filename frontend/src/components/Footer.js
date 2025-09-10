// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Ajio Section */}
        <div className="footer-section">
          <h3>Ajio</h3>
          <ul>
            <li><Link to="https://www.ajio.com/help/whoweare">Who We Are</Link></li>
            <li><Link to="https://www.ajio.com/ajio-careers">Join Our Team</Link></li>
            <li><Link to="https://www.ajio.com/help/termsAndCondition">Terms & Conditions</Link></li>
            <li><Link to="https://www.ajio.com/privacypolicy">We Respect Your Privacy</Link></li>
            <li><Link to="https://www.ajio.com/fee-payment-promotion-policy">Fees & Payments</Link></li>
            <li><Link to="https://www.ajio.com/return-refund-policy">Returns & Refunds Policy</Link></li>
            <li><Link to="https://www.ajio.com/ajio-own-sale-policy">Promotions Terms & Conditions</Link></li>
            <li><Link to="https://blog.ajio.com/?_gl=1*8u4g4a*_gcl_aw*R0NMLjE3NTczMDkyMjguQ2p3S0NBancydlRGQmhBdUVpd0FGYVNjd3IzSkMzYS1ZZXJZYjJDbUlMOEUwN2xjYnJZTUtWMWdBV05tWFB1MDBhcldPSmcyWVBmdnZob0NSVlVRQXZEX0J3RQ..*_gcl_au*MTE0MDU5MjA3Ni4xNzU3MzA3NTI5*_ga*MTc5MDQ5ODY0OC4xNzU3MzA3NTI4*_ga_X3MNHK0RVR*czE3NTczOTUzNjEkbzIkZzEkdDE3NTczOTU2MjUkajMyJGwwJGgw">Blog</Link></li>
          </ul>
        </div>

        {/* Help Section */}
        <div className="footer-section">
          <h3>Help</h3>
          <ul>
            <li><Link to="/track-order">Track Your Order</Link></li>
            <li><Link to="/faq">Frequently Asked Questions</Link></li>
            <li><Link to="/returns">Returns</Link></li>
            <li><Link to="/cancellations">Cancellations</Link></li>
            <li><Link to="/payments">Payments</Link></li>
            <li><Link to="/support">Customer Care</Link></li>
            <li><Link to="https://www.ajio.com/coupon-faq">How Do I Redeem My Coupon</Link></li>
          </ul>
        </div>

        {/* Shop By Section */}
        <div className="footer-section">
          <h3>Shop by</h3>
          <ul>
            <li><Link to="/">All</Link></li>
            <li><Link to="/men">Men</Link></li>
            <li><Link to="/women">Women</Link></li>
            <li><Link to="/kids">Kids</Link></li>
            <li><Link to="https://www.ajio.com/shop/indie">Indie</Link></li>
            <li><Link to="https://www.ajio.com/shop/stores">Stores</Link></li>
            <li><Link to="https://www.ajio.com/shop/fresh-arrivals">New Arrivals</Link></li>
            <li><Link to="https://www.ajio.com/help/BrandListing">Brand Directory</Link></li>
            <li><Link to="https://www.ajio.com/?clear=true">Home</Link></li>
            <li><Link to="https://www.ajio.com/capsule/newin">Collections</Link></li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div className="footer-section">
          <h3>Follow us</h3>
          <ul>
            <li><a href="https://facebook.com/ajio" target="_blank" rel="noreferrer">Facebook</a></li>
            <li><a href="https://instagram.com/ajio_life" target="_blank" rel="noreferrer">Instagram - AJIOlife</a></li>
            <li><a href="https://instagram.com/ajio_luxe" target="_blank" rel="noreferrer">Instagram - AJIO Luxe</a></li>
            <li><a href="https://twitter.com/ajio" target="_blank" rel="noreferrer">Twitter</a></li>
            <li><a href="https://pinterest.com/ajio" target="_blank" rel="noreferrer">Pinterest</a></li>
          </ul>
        </div>
      </div>



      {/* Bottom Bar */}
      <div className="footer-bottom">
              {/* Payment Methods */}
      <div className="payment-methods">
        <h4>Payment methods</h4>
        <div className="payment-icons">
        <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" />
        <img src="https://img.icons8.com/color/48/mastercard-logo.png" alt="Mastercard" />
        <img src="https://img.icons8.com/color/48/bank-building.png" alt="Net Banking" />
        </div>
      </div>
        <p>© 2025 AJIO. All rights reserved.</p>
        <p>Secure payments | SSL 256-bit encryption</p>
      </div>
    </footer>
  );
}
