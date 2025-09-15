// frontend/src/pages/ProfilePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import AccountSidebar from "../components/AccountSidebar";
import "../styles/ProfilePage.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    mobile: "",
    role: "",
    inviteCode: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Fetch profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("Unauthorized. Please login.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Profile API response:", res.data);

        // ✅ Directly use res.data (no success/user wrapper)
        if (res.data?._id) {
          setFormData(res.data);
          setOriginalData(res.data);
        } else {
          setMessage("Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err.response || err.message);
        setMessage("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  // ✅ Restore original profile
  const handleRestore = () => {
    setFormData(originalData);
    setMessage("Restored to original details.");
  };

  // ✅ Update profile in DB
  const handleUpdate = async () => {
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API}/api/users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Same fix here: backend just returns updated user object
      if (res.data?._id) {
        setMessage("Profile updated successfully!");
        setOriginalData(res.data);
        setFormData(res.data);
      } else {
        setMessage(res.data?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update error:", err.response || err.message);
      setMessage("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="account-page-container">
      <AccountSidebar />
      <div className="profile-form-container">
        <h2>Personal Information</h2>
        <p>
          Hey there! Fill in your details for a personalized AJIO shopping
          experience.
        </p>

        <form className="profile-form">
          <label>
            Name*
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
            />
          </label>

          <label>
            Email Address*
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
            />
          </label>

          <label>
            Mobile*
            <input
              type="text"
              name="mobile"
              value={formData.mobile || ""}
              disabled // usually phone change requires OTP
            />
          </label>

          <label>
            Gender*
            <div className="gender-options">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === "Female"}
                  onChange={handleChange}
                />{" "}
                Female
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === "Male"}
                  onChange={handleChange}
                />{" "}
                Male
              </label>
            </div>
          </label>

          <label>
            Role
            <select
              name="role"
              value={formData.role || ""}
              onChange={handleChange}
            >
              <option value="">Select Role</option>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Vendor">Vendor</option>
            </select>
          </label>

          <label>
            Invite Code
            <input
              type="text"
              name="inviteCode"
              value={formData.inviteCode || ""}
              onChange={handleChange}
            />
          </label>

          <div className="profile-buttons">
            <button type="button" onClick={handleRestore}>
              RESTORE
            </button>
            <button type="button" onClick={handleUpdate} className="update-btn">
              UPDATE
            </button>
          </div>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
