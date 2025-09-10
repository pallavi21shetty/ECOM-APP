import React, { useState } from "react";
import "../styles/VendorDashboard.css";

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: "Product A", price: 100, stock: 10 },
    { id: 2, name: "Product B", price: 200, stock: 5 },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "" });

  function handleAddProduct(e) {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.stock) return;

    setProducts([
      ...products,
      {
        id: Date.now(),
        name: newProduct.name,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
      },
    ]);
    setNewProduct({ name: "", price: "", stock: "" });
    setShowModal(false);
  }

  function handleDelete(id) {
    setProducts(products.filter((p) => p.id !== id));
  }

  return (
    <section className="products-section">
      <h2>Manage Products</h2>
      <button className="add-btn" onClick={() => setShowModal(true)}>
        + Add Product
      </button>

      <ul className="product-list">
        {products.map((p) => (
          <li key={p.id}>
            <span>
              {p.name} - ₹{p.price} (Stock: {p.stock})
            </span>
            <div>
              <button>Edit</button>
              <button className="delete" onClick={() => handleDelete(p.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <label>
                Product Name
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </label>
              <label>
                Price (₹)
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
              </label>
              <div className="modal-actions">
                <button type="submit">Add</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
