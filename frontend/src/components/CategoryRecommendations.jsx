import React, { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "./BlogCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";

const CategoryRecommendations = ({ currentUserId }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noRecs, setNoRecs] = useState(false);
  const [page, setPage] = useState(0);

  const blogsPerPage = 3;

  useEffect(() => {
    if (!currentUserId) return;

    const fetchCategoryRecs = async () => {
      setLoading(true);
      setNoRecs(false);

      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
        const response = await axios.get(`${API_BASE}/blog/recommend-category-public?userId=${currentUserId}`);
        const recommendations = response.data.recommendations || [];

        if (recommendations.length === 0) {
          setNoRecs(true);
          setBlogs([]);
        } else {
          const sorted = [...recommendations].sort(
            (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
          );
          setBlogs(sorted);
          setPage(0);
        }
      } catch (error) {
        console.error("❌ Error fetching category recommendations:", error);
        setNoRecs(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryRecs();
  }, [currentUserId]);

  const startIndex = page * blogsPerPage;
  const visibleBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  if (!currentUserId) return null;

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
        marginBottom: "40px",
      }}
    >
      <h2
        style={{
          fontWeight: "600",
          marginBottom: 16,
          borderBottom: "2px solid #10b981",
          paddingBottom: 6,
          color: "#10b981",
        }}
      >
        <FontAwesomeIcon icon={faTags} /> From Your Favorite Categories
      </h2>

      {loading ? (
        <p style={{ color: "#888", fontStyle: "italic" }}>
          Loading category recommendations...
        </p>
      ) : noRecs ? (
        <p style={{ color: "#999", fontStyle: "italic" }}>
          No category-based recommendations yet.
        </p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "16px",
            }}
          >
            {visibleBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                currentUserId={currentUserId}
                compact={true}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "42px",
            }}
          >
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              style={{
                flex: "1 1 120px",
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                backgroundColor: page === 0 ? "#eee" : "black",
                color: page === 0 ? "#aaa" : "#fff",
                cursor: page === 0 ? "not-allowed" : "pointer",
              }}
            >
              &lt; Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              style={{
                flex: "1 1 120px",
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                backgroundColor: page >= totalPages - 1 ? "#eee" : "black",
                color: page >= totalPages - 1 ? "#aaa" : "#fff",
                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
              }}
            >
              Next &gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryRecommendations;
