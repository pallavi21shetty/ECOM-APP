// src/context/WishlistContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export function WishlistProvider({ children }) {
  const { user, setShowLoginModal, setPendingWishlistItem, setRedirectPath } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [message, setMessage] = useState("");

  // 🔄 Normalize _id → id, preserve productCode
const normalizeProducts = (data) =>
  Array.isArray(data)
    ? data.map((p) => ({
        ...p,
        id: p._id?.toString() || p.id,         // for toggle logic
        _id: p._id?.toString() || p.id,        // keep _id for backend sync
        productCode: p.productCode || p.id,    // preserve business/product ID
      }))
    : [];


  // 📝 Show temporary messages
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  /**
   * 📥 Fetch wishlist from backend
   */
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.wishlist || [];
      setWishlist(normalizeProducts(data));
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setWishlist([]);
    }
  }, [user]);

  // Load wishlist on login or refresh
  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlist([]);
  }, [user, fetchWishlist]);

  /**
   * ➕ Add product to wishlist (DB + UI)
   */
  const addToWishlist = async (product) => {
    if (!user) {
      // Prompt login if user is not logged in
      setPendingWishlistItem(product);
      setRedirectPath(window.location.pathname);
      setShowLoginModal(true);
      return;
    }

    const productId = product._id?.toString() || product.id;

    // Optimistic update
setWishlist((prev) => {
  if (prev.some((item) => item.id === productId)) return prev;
  return [
    ...prev,
    {
      ...product,                       // keep all fields from the product
      id: productId,                    // for toggle logic
      _id: productId,                   // backend sync
      productCode: product.productCode || product.id,  // ensure productCode exists
    },
  ];
});


    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/wishlist/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Sync with DB response
      if (res.data?.wishlist) {
        setWishlist(normalizeProducts(res.data.wishlist));
      }
      showMessage("Added to wishlist ✅");
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      showMessage("Failed to add wishlist. Try again.");
    }
  };

  /**
   * ❌ Remove product from wishlist (DB + UI)
   */
  const removeFromWishlist = async (productId) => {
    if (!user) {
      showMessage("Login required to remove wishlist items");
      return;
    }

    // Optimistic update
    setWishlist((prev) =>
      prev.filter(
        (item) => item.id !== productId && item._id?.toString() !== productId
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Sync with DB response
      if (res.data?.wishlist) {
        setWishlist(normalizeProducts(res.data.wishlist));
      }
      showMessage("Removed from wishlist ✅");
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      showMessage("Failed to remove wishlist. Try again.");
    }
  };

const toggleWishlist = (product) => {
  const productId = product._id?.toString() || product.id;
  if (isInWishlist(productId)) {
    removeFromWishlist(productId); // no await
  } else {
    addToWishlist(product); // no await
  }
};



  /**
   * 🔍 Check if product is in wishlist
   */
  const isInWishlist = (productId) =>
    wishlist.some((item) => item.id === productId || item._id?.toString() === productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        message,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
