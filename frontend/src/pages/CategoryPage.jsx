import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BlogCard from "../components/BlogCard";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogsByCategory = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/blog/category/${categoryName}`
        );
        setBlogs(res.data || []);
      } catch (err) {
        console.error("Error fetching blogs by category:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogsByCategory();
  }, [categoryName]);

  const capitalizedCategory =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return (
    <div
      style={{
        maxWidth: "60%",
        margin: "40px auto",
        padding: "2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "2rem",
          paddingBottom: "0.5rem",
        }}
      >
        <h1 style={{ fontSize: "2.2rem", color: "#1f2937", fontWeight: "700" }}>
          Category:{" "}
          <span style={{ color: "#4f46e5" }}>{capitalizedCategory}</span>
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1rem", marginTop: "0.5rem" }}>
          Explore top blogs under <strong>{capitalizedCategory}</strong>
        </p>
      </div>

      {loading ? (
        <p style={{ color: "#6b7280", fontStyle: "italic" }}>Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
          No blogs found in this category.
        </p>
      ) : (
        blogs.map((blog) => (
          <div key={blog._id} style={{ marginBottom: "2rem" }}>
            <BlogCard
              blog={blog}
              currentUserId={JSON.parse(localStorage.getItem("user"))?.id}
              compact={false} // or true if you want a smaller version
            />
          </div>
        ))
      )}
    </div>
  );
};

export default CategoryPage;
