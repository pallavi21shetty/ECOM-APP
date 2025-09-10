// src/context/AuthContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

const AuthContext = createContext();

// ✅ Inactivity limit moved outside (1 hour)
const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hour

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingWishlistItem, setPendingWishlistItem] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);
  const [loading, setLoading] = useState(true);

  const inactivityTimer = useRef(null);

  // ✅ Clear inactivity timer
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  }, []);

  // ✅ Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearInactivityTimer();
    setUser(null);
  }, [clearInactivityTimer]);

  // ✅ Start inactivity timer
  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimer.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  }, [clearInactivityTimer, logout]);

  // ✅ Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      startInactivityTimer();
    }
    setLoading(false);
  }, [startInactivityTimer]);

  // ✅ Reset timer whenever user interacts
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    const resetTimer = () => {
      if (user) startInactivityTimer();
    };

    events.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user, startInactivityTimer]);

  // ✅ Login function
  const login = (userData, token) => {
    if (token) localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      startInactivityTimer(); // start after login
    }
    setShowLoginModal(false);
  };

  // ✅ Get auth token for API requests
  const getToken = () => localStorage.getItem("token");

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        showLoginModal,
        setShowLoginModal,
        pendingWishlistItem,
        setPendingWishlistItem,
        redirectPath,
        setRedirectPath,
        getToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook to use Auth context
export const useAuth = () => useContext(AuthContext);
