import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid"; // for generating productId
import "../styles/Products.css";

export default function VendorProducts() {
  const API_BASE = "http://localhost:5000";
  const token = localStorage.getItem("vendor_token");

  const initialForm = {
    title: "",
    brand: "",
    description: "",
    price: "",
    mrp: "",
    discountPercent: "",
    rating: "",
    ratingCount: "",
    gender: "",
    category: "",
    categorySlug: "",
    section: "",
    subcategory: "",
    subcategorySlug: "",
    image: "",
    images: "",
    colors: "",
    sizes: "",
    stock: "",
    tags: "",
    details: "",
  };

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  // Decode vendor id from JWT
  const getVendorId = () => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1])).id;
    } catch {
      return null;
    }
  };

  // Fetch vendor products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/vendor/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setProducts(data);
        else console.error("Fetch products error:", data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const required = ["title", "brand", "price", "gender", "category", "subcategory", "image"];
    for (let field of required) if (!formData[field]) return false;
    return true;
  };

  const formatArrayField = (str) => (str ? str.split(",").map((s) => s.trim()) : []);
  const formatDetailsField = (str) => {
    if (!str) return {};
    const obj = {};
    str.split(",").forEach((pair) => {
      const [key, value] = pair.split(":").map((s) => s.trim());
      if (key && value) obj[key] = value;
    });
    return obj;
  };

  // Build payload for add/update
  const buildPayload = () => ({
    ...formData,
    productId: editingProduct ? undefined : uuidv4(),
    images: formatArrayField(formData.images),
    colors: formatArrayField(formData.colors),
    sizes: formatArrayField(formData.sizes),
    tags: formatArrayField(formData.tags),
    details: formatDetailsField(formData.details),
    status: "pending",
    categorySlug: formData.category.toLowerCase().replace(/\s+/g, "-"),
    subcategorySlug: formData.subcategory.toLowerCase().replace(/\s+/g, "-"),
    vendor: getVendorId(),
  });

  // Add product
  const addProduct = async () => {
    if (!validateForm()) return alert("Please fill all required fields!");
    try {
      const payload = buildPayload();
      const res = await fetch(`${API_BASE}/api/vendor/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts([...products, data]);
        setFormData(initialForm);
      } else {
        alert(data.message || "Error adding product");
        console.error("Add product failed:", data);
      }
    } catch (err) {
      console.error("Network error adding product:", err);
      alert("Network or server error! See console.");
    }
  };

  // Update product
  const updateProduct = async (id) => {
    if (!validateForm()) return alert("Please fill all required fields!");
    try {
      const payload = buildPayload();
      delete payload.productId; // do not update productId
      const res = await fetch(`${API_BASE}/api/vendor/products/id/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(products.map((p) => (p._id === id ? data : p)));
        setEditingProduct(null);
        setFormData(initialForm);
      } else {
        alert(data.message || "Error updating product");
        console.error("Update failed:", data);
      }
    } catch (err) {
      console.error("Network error updating product:", err);
      alert("Network or server error! See console.");
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/vendor/products/id/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProducts(products.filter((p) => p._id !== id));
      else console.error("Delete failed:", data);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Start editing
  const startEdit = (product) => {
    setEditingProduct(product._id);
    setFormData({
      title: product.title,
      brand: product.brand,
      description: product.description || "",
      price: product.price,
      mrp: product.mrp || "",
      discountPercent: product.discountPercent || "",
      rating: product.rating || "",
      ratingCount: product.ratingCount || "",
      gender: product.gender,
      category: product.category,
      section: product.section || "",
      subcategory: product.subcategory,
      image: product.image,
      images: (product.images || []).join(", "),
      colors: (product.colors || []).join(", "),
      sizes: (product.sizes || []).join(", "),
      stock: product.stock,
      tags: (product.tags || []).join(", "),
      details: Object.entries(product.details || {})
        .map(([k, v]) => `${k}:${v}`)
        .join(", "),
    });
  };

  return (
    <div className="vendor-products">
      <h2>My Products</h2>

      {/* Add/Edit Form */}
      <div className="product-form">
        <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
        <div className="form-grid">
          {Object.keys(formData).map((key) =>
            key !== "details" ? (
              <input
                key={key}
                type={["price", "mrp", "discountPercent", "stock", "rating", "ratingCount"].includes(key) ? "number" : "text"}
                name={key}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={formData[key]}
                onChange={handleChange}
              />
            ) : (
              <textarea
                key={key}
                name={key}
                placeholder="Details (key:value, comma-separated)"
                value={formData.details}
                onChange={handleChange}
              />
            )
          )}
        </div>
        <button onClick={editingProduct ? () => updateProduct(editingProduct) : addProduct}>
          {editingProduct ? "Update Product" : "Add Product"}
        </button>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="no-products">No products yet</div>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Title</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.productId}</td>
                <td>{p.title}</td>
                <td>{p.brand}</td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>
                <td className={p.status}>{p.status}</td>
                <td>
                  <button className="edit-btn" onClick={() => startEdit(p)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteProduct(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
