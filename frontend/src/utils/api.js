import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // backend URL
});

// ✅ Products APIs
export const getAllProducts = () => API.get("/products");
export const getProductById = (id) => API.get(`/products/id/${id}`);
export const getProductsByCategory = (category) => API.get(`/products/${category}`);
export const addProduct = (data) => API.post("/products", data);
export const updateProduct = (id, data) => API.put(`/products/id/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/id/${id}`);
