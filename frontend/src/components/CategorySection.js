import React from "react";
import { Link } from "react-router-dom";
import "../styles/CategorySection.css";

const categories = [
  { name: "Men", img: "https://assets.ajio.com/medias/sys_master/images/images/h27/h18/47143956807710/04022022-D-unisex-ajiomania-ethnicwear-mensfestivewear.jpg", link: "/men" },
  { name: "women", img:"https://assets.ajio.com/medias/sys_master/images/images/h2f/h45/47135238946846/04022022-D-unisex-ajiomania-bestofbrands-ritukumar-upto50.jpg", link: "/women" },
  { name: "Kids", img: "https://assets.ajio.com/medias/sys_master/images/images/h3e/h18/47143957004318/04022022-D-unisex-ajiomania-ethnicwear-kidsethnic.jpg", link: "/kids" },
  { name: "Beauty", img: "https://assets.ajio.com/medias/sys_master/images/images/ha8/h55/47143960477726/04022022-D-unisex-ajiomania-beauty-lakme-upto50.jpg", link: "/beauty" },
  { name: "Home & Kitchen", img: "https://images.squarespace-cdn.com/content/v1/65d325ddd662de7fdcb2411f/10660100-39c4-442b-b1f3-1e38be384714/Slab-Style+Cabinets.jpg", link: "/home-kitchen" },
];

export default function CategorySection() {
  return (
    <div className="category-section">
      {categories.map((cat) => (
        <Link key={cat.name} to={cat.link} className="category-card">
          <img src={cat.img} alt={cat.name} />
          <div className="overlay">{cat.name}</div>
        </Link>
      ))}
    </div>
  );
}
