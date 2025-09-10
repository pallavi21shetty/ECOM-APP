import React from "react";
import "../styles/AddressList.css";

export default function AddressList({ addresses, onSelect, onEdit, onAdd, onClose, onDelete }) {
  return (
    <div className="address-list-overlay">
      <div className="address-list">
        <h3>Change Address</h3>
        {addresses.length > 0 ? (
          addresses.map((a, i) => (
            <div key={i} className="address-card">
              <p><strong>{a.name}</strong> ({a.type})</p>
              <p>{a.street}, {a.city}</p>
              <p>{a.state} - {a.pincode}</p>
              <p>Phone: {a.mobile}</p>
              <div className="card-actions">
                <button onClick={() => onSelect(i)}>Select</button>
                <button onClick={() => onEdit(i)}>Edit</button>
                <button className="delete-btn" onClick={() => onDelete(i)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-address">No saved addresses</p>
        )}

        <button className="add-new-btn" onClick={onAdd}>+ Add New Address</button>
        <button className="close-btn" onClick={onClose}>X</button>
      </div>
    </div>
  );
}
