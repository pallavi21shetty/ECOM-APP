const addToRecentlyViewed = (product) => {
  if (!product) return;

  const viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

  // Remove if already exists to avoid duplicates
  const existsIndex = viewed.findIndex((p) => p._id === product._id);
  if (existsIndex !== -1) viewed.splice(existsIndex, 1);

  // Add product with guaranteed brand and title
  viewed.unshift({
    _id: product._id || product.id,
    brand: product.brand || product.name || "Brand Name",
    title: product.title || product.name || "Product Name",
    image: product.image || "",
    price: product.price || 0,
    mrp: product.mrp || 0,
    discountPercent: product.discountPercent || 0,
    rating: product.rating || 0,
    ratingCount: product.ratingCount || 0,
  });

  // Keep only 5 most recent
  localStorage.setItem("recentlyViewed", JSON.stringify(viewed.slice(0, 5)));
};
