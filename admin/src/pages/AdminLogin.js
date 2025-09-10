import React, { useState } from "react";
import "./../styles/AdminLogin.css";

export default function AdminLogin() {
  const API_BASE = "http://localhost:5000"; 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.message || "Login failed" });
        return;
      }
      localStorage.setItem("admin_token", data.token);
      window.location.href = "/admin/dashboard";
    } catch {
      setMsg({ type: "error", text: "Network error" });
    }
  }

  return (
    <div className="admin-login">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Admin Sign In</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button>Sign In</button>
        {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}
      </form>
    </div>
  );
}
