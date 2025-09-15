// src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { menuData } from "./menuData";
import { brandsData } from "./brandsData";
import "../styles/Navbar.css";

// Utility to slugify text
const slug = (s) => {
  if (!s || typeof s !== "string") return "";
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

// Category display order
const ORDER = ["men", "women", "kids", "beauty", "home-kitchen"];

// Convert category key to readable label
const labelFor = (cat) =>
  cat === "home-kitchen" ? "HOME & KITCHEN" : cat.toUpperCase();

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");

  // 🔹 Search States
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🔹 Search handler (menuData only)
  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }

    const q = query.toLowerCase();
    let results = [];

    Object.entries(menuData).forEach(([catKey, catData]) => {
      // Left section
      catData.left.forEach((item) => {
        const [text] = item.split("|");
        if (text.toLowerCase().includes(q)) {
          results.push({
            label: text,
            category: catKey,
            subcategory: slug(text),
            type: "menu",
          });
        }
      });

      // Right section
      Object.values(catData.right).forEach((items) => {
        items.forEach((item) => {
          if (item.toLowerCase().includes(q)) {
            results.push({
              label: item,
              category: catKey,
              subcategory: slug(item),
              type: "menu",
            });
          }
        });
      });
    });

    // ✅ Deduplicate results
    const unique = Array.from(
      new Map(results.map((r) => [`${r.label}-${r.category}`, r])).values()
    );

    setSuggestions(unique.slice(0, 8));
  }, [query]);

  return (
    <div className="main-container">
      <header className="ajio-navbar">
        {/* Top strip */}
        <div className="top-strip">
          {user ? (
            <>
              <span className="profile-link">Hi, {user.name || "User"}</span>
              <Link to="/account/orders">My Account</Link>
              <button
                className="signout-btn"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/signin">Sign In / Join AJIO</Link>
          )}
          <Link to="https://www.ajio.com/selfcare">Customer Care</Link>
          <button className="ajio-luxe">Visit AJIOLUXE</button>
        </div>

        {/* Main navbar */}
        <div className="main-navbar" onMouseLeave={() => setActiveMenu(null)}>
          {/* Logo */}
          <div className="logo">
            <Link to="/">
              <img
                src="https://assets.ajio.com/static/img/Ajio-Logo.svg"
                alt="AJIO Logo"
              />
            </Link>
          </div>

          {/* Categories */}
          <nav className="categories">
            <ul>
              {ORDER.map((cat) => (
                <li key={cat} onMouseEnter={() => setActiveMenu(cat)}>
                  <Link to={`/${cat}`}>{labelFor(cat)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 🔹 Search Bar with Suggestions */}
<div className="search-bar">
  <input
    type="text"
    placeholder="Search AJIO"
    value={query}
    onChange={(e) => {
      setQuery(e.target.value);
      setShowSuggestions(true); // show suggestions as user types
    }}
    onFocus={() => setShowSuggestions(true)}
    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
    onKeyDown={(e) => {
    if (e.key === "Enter") {
      if (suggestions.length > 0) {
        // go to first suggestion
        const s = suggestions[0];
        navigate(`/${s.category}/${slug(s.label)}`);
      } else {
        // go to "no results" page
        navigate(`/search?q=${query}`);
      }
      setQuery("");
      setShowSuggestions(false);
    }
  }}
  />
  <button>
    <span className="material-icons-outlined">search</span>
  </button>

  {/* Suggestions dropdown */}
  {showSuggestions && suggestions.length > 0 && (
    <ul className="search-suggestions">
      {suggestions.map((s, i) => (
        <li
          key={i}
          onMouseDown={(e) => {
            e.preventDefault(); // prevents input blur from cancelling navigation
            if (s.subcategory) {
              navigate(`/${s.category}/${slug(s.label)}`);
            } else {
              navigate(`/${s.category}`);
            }
            setQuery(""); // clear query
            setShowSuggestions(false); // hide dropdown
          }}
          style={{ cursor: "pointer" }}
        >
          <span className="suggestion-title">{s.label}</span>
          <span className="suggestion-tag">({labelFor(s.category)})</span>
        </li>
      ))}
    </ul>
  )}
</div>

          {/* Icons */}
          <div className="icons">
            <Link to="/wishlist" className="circle-icon">
              <span className="material-icons-outlined">favorite_border</span>
            </Link>
            <Link to="/cart" className="circle-icon">
              <span className="material-icons-outlined">shopping_bag</span>
            </Link>
          </div>

          {/* Mega Menu */}
          {activeMenu && (menuData[activeMenu] || brandsData[activeMenu]) && (
            <div
              className="mega-menu"
              onMouseEnter={() => setActiveMenu(activeMenu)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              {/* Tabs */}
              <div className="mega-top">
                <div className="shop-by">Shop By:</div>
                <div className="mega-top-tabs">
                  <button
                    className={activeTab === "categories" ? "active" : ""}
                    onMouseEnter={() => setActiveTab("categories")}
                  >
                    CATEGORIES
                  </button>
                  {activeMenu !== "kids" && activeMenu !== "beauty" && (
                    <button
                      className={activeTab === "brands" ? "active" : ""}
                      onMouseEnter={() => setActiveTab("brands")}
                    >
                      BRANDS
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="mega-content">
                {activeTab === "categories" ? (
                  <>
                    {/* Left */}
                    <div className="mega-left">
                      <ul>
                        {menuData[activeMenu]?.left?.map((item) => {
                          const [text, tag] = item.split("|");
                          return (
                            <li key={text}>
                              <Link
                                to={`/${activeMenu}/${slug(text)}`}
                                onClick={() => setActiveMenu(null)}
                              >
                                {text}
                              </Link>
                              {tag === "new" && (
                                <span className="tag new">NEW</span>
                              )}
                              {tag === "hot" && (
                                <span className="tag hot">HOT</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Right */}
                    <div className="mega-grid">
                      {Object.entries(menuData[activeMenu]?.right || {}).map(
                        ([section, items]) => (
                          <div className="mega-column" key={section}>
                            <h4>{section}</h4>
                            <ul>
                              {items.map((item) => (
                                <li key={item}>
                                  <Link
                                    to={`/${activeMenu}/${slug(item)}`}
                                    onClick={() => setActiveMenu(null)}
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mega-grid">
                    {Object.entries(brandsData[activeMenu] || {}).map(
                      ([section, items]) => (
                        <div className="mega-column" key={section}>
                          <h4>{section}</h4>
                          <ul>
                            {items.map((brand) => (
                              <li key={brand}>
                                <Link
                                  to={`/brand/${slug(brand)}`}
                                  onClick={() => setActiveMenu(null)}
                                >
                                  {brand}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
