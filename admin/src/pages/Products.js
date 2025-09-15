import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // ✅ for pagination only
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

  // ✅ Pagination
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );

  // ✅ Filters (not persisted in URL)
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");
  const [status, setStatus] = useState("");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
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

  // ✅ Sync pagination with URL
  useEffect(() => {
    if (currentPage > 1) {
      setSearchParams({ page: currentPage });
    } else {
      setSearchParams({});
    }
  }, [currentPage, setSearchParams]);

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

  // ✅ Apply filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice =
      (!minPrice || p.price >= Number(minPrice)) &&
      (!maxPrice || p.price <= Number(maxPrice));

    const matchesStock =
      (!minStock || p.stock >= Number(minStock)) &&
      (!maxStock || p.stock <= Number(maxStock));

    const matchesStatus = !status || p.status === status;

    return matchesSearch && matchesPrice && matchesStock && matchesStatus;
  });

  // ✅ Pagination logic (after filtering)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-products">
      <h2>Products</h2>

      {/* ✅ Filter Controls */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title or brand"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Stock"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Stock"
          value={maxStock}
          onChange={(e) => setMaxStock(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={() => {
          setSearchTerm("");
          setMinPrice("");
          setMaxPrice("");
          setMinStock("");
          setMaxStock("");
          setStatus("");
        }}>Reset</button>
      </div>

      {filteredProducts.length === 0 ? (
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
