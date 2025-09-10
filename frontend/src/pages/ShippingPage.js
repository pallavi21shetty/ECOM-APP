// src/pages/ShippingPage.js
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";  // ✅ for navigation
import AddressForm from "../components/AddressForm";
import AddressList from "../components/AddressList";
import "../styles/ShippingPage.css";

export default function ShippingPage() {
  const { cart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem("addresses");
    return saved ? JSON.parse(saved) : [];
  });
  const [selected, setSelected] = useState(addresses.length > 0 ? 0 : null);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showList, setShowList] = useState(false);

  // Delivery state
  const [locationAllowed, setLocationAllowed] = useState(null);
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // ✅ Normalize city + pincode check
  function isDeliverable(cityName, pin) {
    if (!cityName && !pin) return false;
    const normalized = (cityName || "").toLowerCase();

    const cityOk =
      normalized.includes("bangalore") || normalized.includes("bengaluru");

    const pinOk = pin && pin.startsWith("560"); // ✅ Allow only 560xxx pincodes

    return cityOk || pinOk;
  }

  // 🛰 Detect location with geolocation API
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            const detectedCity =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.county ||
              "";
            const detectedPin = data.address.postcode || "";

            setCity(detectedCity);
            setPincode(detectedPin);

            setLocationAllowed(isDeliverable(detectedCity, detectedPin));
          } catch (err) {
            console.error("Error fetching location:", err);
            setLocationAllowed(false);
          }
        },
        (err) => {
          console.error("Geolocation denied:", err);
          setLocationAllowed(false);
        }
      );
    } else {
      setLocationAllowed(false);
    }
  }, []);

  // ✅ Also check based on selected shipping address
  useEffect(() => {
    if (selected !== null && addresses[selected]) {
      const addrCity = addresses[selected].city || "";
      const addrPin = addresses[selected].pincode || "";
      setCity(addrCity);
      setPincode(addrPin);
      setLocationAllowed(isDeliverable(addrCity, addrPin));
    }
  }, [selected, addresses]);

  // Save / update address
  function handleSave(address) {
    let updated = [...addresses];
    if (editIndex !== null) {
      updated[editIndex] = address; // edit
    } else {
      updated.push(address); // new
    }
    setAddresses(updated);
    localStorage.setItem("addresses", JSON.stringify(updated));
    setShowForm(false);
    setEditIndex(null);
    setSelected(updated.length - 1);
  }

  // 🧮 Totals
  const bagTotal = cart.reduce(
    (sum, item) => sum + item.product.mrp * item.qty,
    0
  );
  const bagDiscount = cart.reduce(
    (sum, item) => sum + (item.product.mrp - item.product.price) * item.qty,
    0
  );
  const orderTotal = bagTotal - bagDiscount + 29;

  // 📅 Delivery date (7 days from today)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const deliveryDateStr = deliveryDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  // ✅ Handle Proceed to Payment
  function handleProceed() {
    if (!locationAllowed) return;
    navigate("/payment", {
      state: {
        cart,
        orderTotal,
        address: addresses[selected] || null,
        deliveryDate: deliveryDateStr,
      },
    });
  }

  return (
    <div className="shipping-container">
      {/* LEFT SIDE */}
      <div className="left-section">
        {/* Address */}
        {selected !== null && addresses[selected] ? (
          <div className="selected-address">
            <p>
              <strong>{addresses[selected].name}</strong> (
              {addresses[selected].type})
            </p>
            <p>
              {addresses[selected].street}, {addresses[selected].landmark}
            </p>
            <p>
              {addresses[selected].city}, {addresses[selected].state} -{" "}
              {addresses[selected].pincode}
            </p>
            <p>Phone: {addresses[selected].mobile}</p>
            <button onClick={() => setShowList(true)}>Change Address</button>
          </div>
        ) : (
          <button
            className="add-address-btn"
            onClick={() => setShowForm(true)}
          >
            + Add Address
          </button>
        )}

        {/* COD + Delivery in same row */}
        <div className="cod-delivery-row">
          <div className="cod-note">
            <p>
              <strong>Cash on Delivery</strong> Available
            </p>
          </div>
          <div className="delivery-note">
            <h3>Delivery Status</h3>
            {locationAllowed === null ? (
              <p>Checking your location...</p>
            ) : locationAllowed ? (
              <p className="delivery-date">
                ✅ Est Delivery {deliveryDateStr} ({city} {pincode})
              </p>
            ) : (
              <p className="delivery-date error">
                ❌ Can’t deliver to your location ({city || "Unknown"}{" "}
                {pincode || ""})
              </p>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className="delivery-section">
          {cart.map((item, i) => (
            <div className="delivery-item" key={i}>
              <img src={item.product.image} alt={item.product.title} />
              <div>
                <p>{item.product.title}</p>
                <p>Qty: {item.qty}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <AddressForm
            onClose={() => setShowForm(false)}
            onSave={handleSave}
            data={editIndex !== null ? addresses[editIndex] : null}
          />
        )}

        {/* Change Address List */}
        {showList && (
          <AddressList
            addresses={addresses}
            onSelect={(i) => {
              setSelected(i);
              setShowList(false);
            }}
            onEdit={(i) => {
              setEditIndex(i);
              setShowForm(true);
              setShowList(false);
            }}
            onAdd={() => {
              setEditIndex(null);
              setShowForm(true);
              setShowList(false);
            }}
            onClose={() => setShowList(false)}
          />
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="order-summary">
        <h3>Order Details</h3>
        <p>Bag Total: ₹{bagTotal}</p>
        <p>Bag Discount: -₹{bagDiscount}</p>
        <p>
          Delivery Fee: <s>₹99</s> Free
        </p>
        <p>Platform Fee: ₹29</p>
        <hr />
        <h4>Order Total: ₹{orderTotal}</h4>
        <button
          className="proceed-btn"
          disabled={!locationAllowed}
          onClick={handleProceed}   // ✅ Go to payment
          title={
            locationAllowed
              ? "Proceed to payment"
              : "Delivery not available to your location"
          }
        >
          PROCEED TO PAYMENT
        </button>
      </div>
    </div>
  );
}
