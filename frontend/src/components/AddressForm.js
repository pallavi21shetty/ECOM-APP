import React, { useState } from "react";
import "../styles/AddressForm.css";

export default function AddressForm({ onClose, onSave, data }) {
  const [form, setForm] = useState(
    data || {
      name: "",
      mobile: "",
      pincode: "",
      street: "",
      landmark: "",
      city: "",
      state: "",
      type: "Home",
    }
  );

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // basic validation
    if (
      !form.name ||
      !form.mobile ||
      !form.pincode ||
      !form.street ||
      !form.city ||
      !form.state
    ) {
      alert("Please fill all required fields");
      return;
    }

    onSave(form);
  }

  return (
    <div className="address-form-overlay">
      <div className="address-form">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>{data ? "Edit Address" : "Add New Address"}</h3>

        <form onSubmit={handleSubmit}>
          <label>
            Full Name*
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Mobile Number*
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Pin Code*
            <input
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Street / Locality*
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Landmark
            <input
              name="landmark"
              value={form.landmark}
              onChange={handleChange}
            />
          </label>

          <label>
            City*
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            State*
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </label>

          <div className="type-select">
            <p>Address Type*</p>
            <label>
              <input
                type="radio"
                name="type"
                value="Home"
                checked={form.type === "Home"}
                onChange={handleChange}
              /> Home
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="Work"
                checked={form.type === "Work"}
                onChange={handleChange}
              /> Work
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="Other"
                checked={form.type === "Other"}
                onChange={handleChange}
              /> Other
            </label>
          </div>

          <div className="actions">
            <button type="submit" className="save-btn">
              Save
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
