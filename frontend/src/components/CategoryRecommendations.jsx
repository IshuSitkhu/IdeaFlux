import React, { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "./BlogCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";

const CategoryRecommendations = ({ currentUserId, refreshTrigger }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noRecs, setNoRecs] = useState(false);
  const [page, setPage] = useState(0);

  const blogsPerPage = 3;

  const fetchCategoryRecs = async () => {
    setLoading(true);
    setNoRecs(false);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
      console.log("📡 CategoryRecs: Fetching from API...");
      const response = await axios.get(`${API_BASE}/blog/recommend-category-public?userId=${currentUserId}`);
      const recommendations = response.data.recommendations || [];

      console.log("📦 CategoryRecs: Received", recommendations.length, "recommendations");
      console.log("📦 CategoryRecs: Full data:", recommendations);

      if (recommendations.length === 0) {
        console.log("⚠️ CategoryRecs: No recommendations found, showing empty message");
        setNoRecs(true);
        setBlogs([]);
      } else {
        console.log("✅ CategoryRecs: Setting", recommendations.length, "blogs to state");
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

  useEffect(() => {
    if (!currentUserId) return;
    fetchCategoryRecs();
  }, [currentUserId, refreshTrigger]);

  const startIndex = page * blogsPerPage;
  const visibleBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  // Callback to refresh recommendations when user likes/unlikes
  const handleLikeChange = () => {
    console.log("🔄 CategoryRecs: Like changed, refreshing in 1000ms...");
    // Add delay to ensure database is updated
    setTimeout(() => {
      console.log("🔄 CategoryRecs: Now fetching updated recommendations...");
      fetchCategoryRecs();
    }, 1000);
  };

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
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 320px))",
              gap: "20px",
              marginBottom: "16px",
              justifyContent: "center",
            }}
          >
            {visibleBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                currentUserId={currentUserId}
                compact={true}
                onLikeChange={handleLikeChange}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0}
                style={{
                  width: "40px",
                  height: "40px",
                  padding: "0",
                  border: "2px solid #10b981",
                  borderRadius: "50%",
                  backgroundColor: page === 0 ? "#f3f4f6" : "#fff",
                  color: page === 0 ? "#9ca3af" : "#10b981",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (page !== 0) {
                    e.target.style.backgroundColor = "#10b981";
                    e.target.style.color = "#fff";
                    e.target.style.transform = "scale(1.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== 0) {
                    e.target.style.backgroundColor = "#fff";
                    e.target.style.color = "#10b981";
                    e.target.style.transform = "scale(1)";
                  }
                }}
              >
                ‹
              </button>

              <span
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#10b981",
                  color: "#fff",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  minWidth: "80px",
                  textAlign: "center",
                }}
              >
                {page + 1} of {totalPages}
              </span>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
                style={{
                  width: "40px",
                  height: "40px",
                  padding: "0",
                  border: "2px solid #10b981",
                  borderRadius: "50%",
                  backgroundColor: page >= totalPages - 1 ? "#f3f4f6" : "#fff",
                  color: page >= totalPages - 1 ? "#9ca3af" : "#10b981",
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (page < totalPages - 1) {
                    e.target.style.backgroundColor = "#10b981";
                    e.target.style.color = "#fff";
                    e.target.style.transform = "scale(1.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (page < totalPages - 1) {
                    e.target.style.backgroundColor = "#fff";
                    e.target.style.color = "#10b981";
                    e.target.style.transform = "scale(1)";
                  }
                }}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoryRecommendations;