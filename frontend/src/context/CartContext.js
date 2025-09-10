// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useWishlist } from "./WishlistContext";

const CartContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export function CartProvider({ children }) {
  const { user, setShowLoginModal, setPendingWishlistItem, setRedirectPath } = useAuth();
  const { addToWishlist } = useWishlist();

  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  // 🔹 Show temporary messages
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // 📥 Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(res.data.cart || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchCart();
    else setCart([]);
  }, [user, fetchCart]);

  // ➕ Add product to cart
  const addToCart = async ({ productId, qty = 1, size, color, price, mrp, discountPercent, image, title }) => {
    if (!user) {
      setShowLoginModal(true);
      setRedirectPath(window.location.pathname);
      setPendingWishlistItem({ productId, qty, size, color, price, mrp, discountPercent, image, title });
      return;
    }

    // Optimistic UI update
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.product._id === productId && c.size === size && c.color === color
      );
      if (existing) {
        return prev.map((c) =>
          c.product._id === productId && c.size === size && c.color === color
            ? { ...c, qty: c.qty + qty }
            : c
        );
      } else {
        return [
          ...prev,
          {
            product: { _id: productId, title, price, mrp, discountPercent, image },
            qty,
            size,
            color,
          },
        ];
      }
    });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/cart/${productId}`,
        { qty, size, color, price, mrp, discountPercent, image, title },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCart(res.data.cart || []);
      showMessage("Added to cart ✅");
    } catch (err) {
      console.error("Error adding to cart:", err);
      showMessage("Failed to add to cart. Try again.");
    }
  };

  // ➖ Remove product from cart
  const removeFromCart = async (productId, size, color) => {
    if (!user) return showMessage("Login required");

    // Optimistic update
    setCart((prev) =>
      prev.filter((c) => !(c.product._id === productId && c.size === size && c.color === color))
    );

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_URL}/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { size, color },
      });

      setCart(res.data.cart || []);
      showMessage("Removed from cart ✅");
    } catch (err) {
      console.error(err);
      showMessage("Failed to remove from cart. Try again.");
    }
  };

  // 🔄 Update quantity
  const updateQuantity = async (productId, size, color, qty) => {
    setCart((prev) =>
      prev.map((c) =>
        c.product._id === productId && c.size === size && c.color === color ? { ...c, qty } : c
      )
    );

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/api/cart/${productId}`,
        { qty, size, color },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCart(res.data.cart || []);
    } catch (err) {
      console.error(err);
      showMessage("Failed to update cart. Try again.");
    }
  };

  // 🔁 Move item to wishlist
  const moveToWishlist = async (item) => {
    if (!user) {
      setShowLoginModal(true);
      setRedirectPath(window.location.pathname);
      setPendingWishlistItem(item);
      return;
    }

    // 1️⃣ Remove from cart
    await removeFromCart(item.product._id, item.size, item.color);

    // 2️⃣ Add to wishlist
    await addToWishlist({
      productId: item.product._id,
      title: item.product.title,
      price: item.product.price,
      mrp: item.product.mrp,
      discountPercent: item.product.discountPercent,
      image: item.product.image,
      size: item.size,
      color: item.color,
    });

    showMessage("Moved to wishlist ✅");
  };

  // 🔍 Check if product is in cart
  const isInCart = (productId, size, color) =>
    cart.some((c) => c.product._id === productId && c.size === size && c.color === color);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        fetchCart,
        isInCart,
        moveToWishlist,
        message,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
