// src/App.js
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sign from "./components/Sign";
import Register from "./components/Register";
import "./styles/Navbar.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { WishlistProvider, useWishlist } from "./context/WishlistContext";

// Pages
import CategoryPage from "./pages/CategoryPage";
import BrandPage from "./pages/BrandPage";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutSteps from "./components/CheckoutSteps";
import HomePage from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import MyOrdersPage from "./pages/MyOrdersPage";

// Category landing pages
import MenPage from "./pages/Men";
import WomenPage from "./pages/Women";
import KidsPage from "./pages/Kids";
import BeautyPage from "./pages/Beauty";
import HomeKitchenPage from "./pages/HomeKitchen";

// Checkout flow pages
import ShippingPage from "./pages/ShippingPage";
import PaymentPage from "./pages/PaymentPage";

// Scroll components
import ScrollToTopButton from "./components/ScrollToTopButton";
import OrderDetails from "./pages/OrderDetails";

// ✅ Account pages
import WalletPage from "./pages/WalletPage";
import InvitePage from "./pages/InvitePage";
import RewardsPage from "./pages/RewardsPage";
import ProfilePage from "./pages/ProfilePage";
import AddressPage from "./pages/AddressPage";
import PaymentsPage from "./pages/PaymentsPage";

// ✅ Auto scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function Layout() {
  const location = useLocation();

  // Determine checkout step
  const getStep = () => {
    if (location.pathname === "/cart") return 0;
    if (location.pathname === "/checkout") return 1;
    if (location.pathname === "/payment") return 2;
    return -1;
  };

  const step = getStep();
  const isCheckout = step !== -1;

  return (
    <>
      <ScrollToTop />

      {isCheckout ? <CheckoutSteps step={step} /> : <Navbar />}

      <Routes>
        {/* Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* ✅ Search */}
        <Route path="/search" element={<SearchResults />} />

        {/* ✅ Account routes */}
        <Route path="/account/orders" element={<MyOrdersPage />} />
        <Route path="/account/wallet" element={<WalletPage />} />
        <Route path="/account/invite" element={<InvitePage />} />
        <Route path="/account/rewards" element={<RewardsPage />} />
        <Route path="/account/profile" element={<ProfilePage />} />
        <Route path="/account/address" element={<AddressPage />} />
        <Route path="/account/payments" element={<PaymentsPage />} />

        {/* Category main routes */}
        <Route path="/men" element={<MenPage />} />
        <Route path="/women" element={<WomenPage />} />
        <Route path="/kids" element={<KidsPage />} />
        <Route path="/beauty" element={<BeautyPage />} />
        <Route path="/home-kitchen" element={<HomeKitchenPage />} />

        {/* Auth */}
        <Route path="/signin" element={<Sign />} />
        <Route path="/register" element={<Register />} />

        {/* Wishlist & Cart */}
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* Category & Brand pages */}
        <Route path="/:category/:subcategory" element={<CategoryPage />} />
        <Route path="/brand/:brand" element={<BrandPage />} />

        {/* Product details */}
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* Checkout flow */}
        <Route path="/checkout" element={<ShippingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
      </Routes>

      <ScrollToTopButton />
      <Footer />
    </>
  );
}

function AppWrapper() {
  const {
    showLoginModal,
    setShowLoginModal,
    user,
    pendingWishlistItem,
    setPendingWishlistItem,
    redirectPath,
    setRedirectPath,
  } = useAuth();

  const { addToWishlist, fetchWishlist } = useWishlist();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchCart();
    }
  }, [user, fetchWishlist, fetchCart]);

  // Handle pending wishlist/cart after login
  useEffect(() => {
    if (user && pendingWishlistItem && redirectPath) {
      addToWishlist(pendingWishlistItem);
      setPendingWishlistItem(null);
      navigate(redirectPath, { replace: true });
      setRedirectPath(null);
    }
  }, [
    user,
    pendingWishlistItem,
    redirectPath,
    addToWishlist,
    navigate,
    setPendingWishlistItem,
    setRedirectPath,
  ]);

  return (
    <>
      <Layout />
      {showLoginModal && <Sign onClose={() => setShowLoginModal(false)} />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <AppWrapper />
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
