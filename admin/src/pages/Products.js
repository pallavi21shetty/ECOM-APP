import React, { useEffect, useState } from "react";

export default function Products() {
  const API_BASE = "http://localhost:5000";
  const token = localStorage.getItem("admin_token");

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setProducts(data);
      } catch {
        console.error("Error fetching products");
      }
    };
    fetchProducts();
  }, [token]);

  return (
    <>
      <h2>Products</h2>
      {products.length === 0 ? (
        <div>No products</div>
      ) : (
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
