import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/SearchResults.css";
import ProductCard from "../components/ProductCard";
import FeaturesSection from "../components/FeaturesSection";

export default function SearchResults() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q");

  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    setRecentlyViewed(viewed);
  }, [query]);

  // Fill to ensure 5 cards in grid
  const displayedProducts = [...recentlyViewed];
  while (displayedProducts.length < 5) {
    displayedProducts.push(null); // placeholder
  }

  return (
    <div className="search-page">
      <div className="no-results">
        {query && (
          <h2>
            Sorry! We couldn't find any matching items for<br/>
            {" "}
            <span className="highlight">{query}</span>
          </h2>
        )}
        <p className="hint">
          Don’t give up - check the spelling, or try less specific search terms
        </p>
      </div>

      <div className="recently-viewed">
        <h3>Recently Viewed</h3>

        <div className="product-grid">
          {displayedProducts.map((p, i) =>
            p ? (
              <ProductCard
                key={p._id}
                product={{
                  productId: p._id,
                  brand: p.brand,
                  title: p.title,
                  image: p.image,
                  price: p.price,
                  mrp: p.mrp,
                  discountPercent: p.discountPercent,
                  rating: p.rating,
                  ratingCount: p.ratingCount,
                }}
              />
            ) : (
              <div key={i} className="product-placeholder" />
            )
          )}
        </div>
      </div>
        <FeaturesSection />
    </div>
  );
}
