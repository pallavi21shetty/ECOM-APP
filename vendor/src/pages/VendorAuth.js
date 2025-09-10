import React, { useState, useRef, useEffect } from "react";
import "../styles/VendorAuth.css";

export default function VendorAuth({ onLoginSuccess }) {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const [tab, setTab] = useState("register"); // register | login
  const [form, setForm] = useState({
    name: "",
    age: "",
    mobile: "",
    email: "",
    password: "",
    gstin: "",
    shopName: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState(null);
  const [loginMessage, setLoginMessage] = useState(null);

  const registerMsgRef = useRef(null);
  const loginMsgRef = useRef(null);

  useEffect(() => {
    if (submitMessage && registerMsgRef.current) {
      registerMsgRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [submitMessage]);

  useEffect(() => {
    if (loginMessage && loginMsgRef.current) {
      loginMsgRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [loginMessage]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function updateLoginField(key, value) {
    setLoginForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const err = {};
    if (!form.name.trim()) err.name = "Name required";
    if (!form.age || Number(form.age) < 18) err.age = "Age must be 18+";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) err.mobile = "Enter valid 10-digit mobile";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Enter valid email";
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(form.password))
      err.password = "Password min 6 chars with letters & numbers";
    if (form.gstin && !/^[0-9A-Za-z]{15}$/.test(form.gstin)) err.gstin = "GSTIN must be 15 alphanumeric chars";
    if (!form.shopName.trim()) err.shopName = "Shop Name required";
    if (!form.street.trim()) err.street = "Street required";
    if (!form.city.trim()) err.city = "City required";
    if (!form.state.trim()) err.state = "State required";
    if (!/^\d{6}$/.test(form.pincode)) err.pincode = "Enter valid 6-digit pincode";
    return err;
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErrors({});
    setSubmitMessage(null);

    const err = validate();
    if (Object.keys(err).length) return setErrors(err);

    try {
      const res = await fetch(`${API_BASE}/api/vendor-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          age: Number(form.age),
          mobile: form.mobile.trim(),
          email: form.email.trim(),
          password: form.password,
          gstin: form.gstin.trim() || undefined,
          shopName: form.shopName.trim(),
          shopAddress: {
            street: form.street.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMessage({
          type: "success",
          text: data.message || "Request submitted successfully. Awaiting admin approval.",
        });
        setForm({
          name: "",
          age: "",
          mobile: "",
          email: "",
          password: "",
          gstin: "",
          shopName: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
        });
      } else {
        setSubmitMessage({ type: "error", text: data.message || "Failed to submit request" });
      }
    } catch {
      setSubmitMessage({ type: "error", text: "Network error, try again later" });
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/vendor/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok && data.vendor) {
        localStorage.setItem("vendor_token", data.token);
        setLoginMessage({ type: "success", text: `Welcome, ${data.vendor.name}` });
        onLoginSuccess(data.vendor); // 🚀 send vendor to parent
      } else {
        setLoginMessage({ type: "error", text: data.message || "Login failed" });
      }
    } catch {
      setLoginMessage({ type: "error", text: "Network error" });
    }
  }

  return (
    <div className="vendor-auth">
      <h1>Vendor Portal</h1>
      <div className="tabs">
        <button className={tab === "register" ? "tab-active" : ""} onClick={() => setTab("register")}>
          Register
        </button>
        <button className={tab === "login" ? "tab-active" : ""} onClick={() => setTab("login")}>
          Login
        </button>
      </div>

      {tab === "register" ? (
        <form onSubmit={handleRegister}>
          <label htmlFor="name">Name</label>
          <input id="name" placeholder="Enter name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
          {errors.name && <div className="error">{errors.name}</div>}

          <label htmlFor="age">Age</label>
          <input id="age" placeholder="Enter age" value={form.age} onChange={(e) => updateField("age", e.target.value)} />
          {errors.age && <div className="error">{errors.age}</div>}

          <label htmlFor="mobile">Mobile</label>
          <input id="mobile" placeholder="Enter mobile" value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} />
          {errors.mobile && <div className="error">{errors.mobile}</div>}

          <label htmlFor="email">Email</label>
          <input id="email" placeholder="Enter email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          {errors.email && <div className="error">{errors.email}</div>}

          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Enter password" value={form.password} onChange={(e) => updateField("password", e.target.value)} />
          {errors.password && <div className="error">{errors.password}</div>}

          <label htmlFor="gstin">GSTIN (optional)</label>
          <input id="gstin" placeholder="Enter GSTIN" value={form.gstin} onChange={(e) => updateField("gstin", e.target.value)} />
          {errors.gstin && <div className="error">{errors.gstin}</div>}

          <label htmlFor="shopName">Shop Name</label>
          <input id="shopName" placeholder="Enter shop name" value={form.shopName} onChange={(e) => updateField("shopName", e.target.value)} />
          {errors.shopName && <div className="error">{errors.shopName}</div>}

          <label htmlFor="street">Street</label>
          <input id="street" placeholder="Enter street" value={form.street} onChange={(e) => updateField("street", e.target.value)} />
          {errors.street && <div className="error">{errors.street}</div>}

          <label htmlFor="city">City</label>
          <input id="city" placeholder="Enter city" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
          {errors.city && <div className="error">{errors.city}</div>}

          <label htmlFor="state">State</label>
          <input id="state" placeholder="Enter state" value={form.state} onChange={(e) => updateField("state", e.target.value)} />
          {errors.state && <div className="error">{errors.state}</div>}

          <label htmlFor="pincode">Pincode</label>
          <input id="pincode" placeholder="Enter pincode" value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} />
          {errors.pincode && <div className="error">{errors.pincode}</div>}

          <button type="submit">Submit Registration</button>
          {submitMessage && <div ref={registerMsgRef} className={submitMessage.type}>{submitMessage.text}</div>}
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <label htmlFor="loginEmail">Email</label>
          <input id="loginEmail" placeholder="Enter email" value={loginForm.email} onChange={(e) => updateLoginField("email", e.target.value)} />

          <label htmlFor="loginPassword">Password</label>
          <input id="loginPassword" type="password" placeholder="Enter password" value={loginForm.password} onChange={(e) => updateLoginField("password", e.target.value)} />

          <button type="submit">Login</button>
          {loginMessage && <div ref={loginMsgRef} className={loginMessage.type}>{loginMessage.text}</div>}
        </form>
      )}
    </div>
  );
}
