import React, { useEffect, useState } from "react";
import "../styles/Products.css";

export default function Products() {
  const API_BASE = "http://localhost:5000";
  const token = localStorage.getItem("admin_token");

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    price: "",
    mrp: "",
    discountPercent: "",
    category: "",
    subcategory: "",
    stock: "",
    image: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Fetch products
 useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // sort newest first (assuming createdAt is present)
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setProducts(sorted);
      }
    } catch {
      console.error("Error fetching products");
    }
  };

  fetchProducts();
}, [token, API_BASE]);

  // Delete product
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setProducts(products.filter((p) => p._id !== id));
    } catch {
      console.error("Error deleting product");
    }
  };

  // Start editing
  const startEdit = (product) => {
    setEditingProduct(product._id);
    setFormData({
      title: product.title,
      brand: product.brand,
      price: product.price,
      mrp: product.mrp,
      discountPercent: product.discountPercent,
      category: product.category,
      subcategory: product.subcategory,
      stock: product.stock,
      image: product.image,
    });
  };

  // Update product
  const updateProduct = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map((p) => (p._id === id ? updated : p)));
        setEditingProduct(null);
      }
    } catch {
      console.error("Error updating product");
    }
  };

  // Approve product
  const approveProduct = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map((p) => (p._id === id ? updated : p)));
      }
    } catch {
      console.error("Error approving product");
    }
  };

  // Reject product
  const rejectProduct = async (id) => {
    try {
      const reason = prompt("Enter rejection reason:") || "Rejected by admin";
      const res = await fetch(`${API_BASE}/api/admin/products/status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rejected", reason }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map((p) => (p._id === id ? updated : p)));
      }
    } catch {
      console.error("Error rejecting product");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-products">
      <h2>Products</h2>
      {products.length === 0 ? (
        <div className="no-products">No products</div>
      ) : (
        <>
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Price</th>
                <th>MRP</th>
                <th>Discount %</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p) => (
                <tr key={p._id}>
                  {editingProduct === p._id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) =>
                            setFormData({ ...formData, image: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={(e) =>
                            setFormData({ ...formData, brand: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={formData.subcategory}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subcategory: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={formData.mrp}
                          onChange={(e) =>
                            setFormData({ ...formData, mrp: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={formData.discountPercent}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discountPercent: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={(e) =>
                            setFormData({ ...formData, stock: e.target.value })
                          }
                        />
                      </td>
                      <td>{p.status}</td>
                      <td>
                        <button
                          onClick={() => updateProduct(p._id)}
                          className="save-btn"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingProduct(null)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <img src={p.image} alt={p.title} />
                      </td>
                      <td>{p.title}</td>
                      <td>{p.brand}</td>
                      <td>{p.category}</td>
                      <td>{p.subcategory}</td>
                      <td>₹{p.price}</td>
                      <td>₹{p.mrp}</td>
                      <td>{p.discountPercent}%</td>
                      <td>{p.stock}</td>
                      <td>{p.status}</td>
                      <td>
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => approveProduct(p._id)}
                              className="approve-btn"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectProduct(p._id)}
                              className="reject-btn"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => startEdit(p)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
