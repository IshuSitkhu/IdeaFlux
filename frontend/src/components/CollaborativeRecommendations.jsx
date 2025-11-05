import React, { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "./BlogCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain } from "@fortawesome/free-solid-svg-icons";

const CollaborativeRecommendations = ({ userId, refreshTrigger }) => {
  const [recommendedBlogs, setRecommendedBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noRecs, setNoRecs] = useState(false);
  const [page, setPage] = useState(0);

  const blogsPerPage = 3;
  const totalPages = Math.ceil(recommendedBlogs.length / blogsPerPage);
  const startIndex = page * blogsPerPage;
  const visibleBlogs = recommendedBlogs.slice(startIndex, startIndex + blogsPerPage);

  const fetchRecommendations = async () => {
    setLoading(true);
    setNoRecs(false);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;

      console.log("📡 CollabRecs: Fetching from API...");
      const { data: recData } = await axios.get(`${API_BASE}/blog/recommend-collab`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("📦 CollabRecs: Received raw data:", recData);
      const recommendations = (recData.recommendations || []).filter((r) => r.score > 0);
      console.log("📦 CollabRecs: Filtered", recommendations.length, "recommendations with score > 0");

      if (recommendations.length === 0) {
        console.log("⚠️ CollabRecs: No recommendations, showing empty message");
        setRecommendedBlogs([]);
        setNoRecs(true);
        return;
      }

      const recommendedIds = recommendations.map((r) => r.blogId);
      const scoreMap = Object.fromEntries(recommendations.map((r) => [r.blogId, r.score]));

      const { data: blogsData } = await axios.get(
        `${API_BASE}/blog/metadata?ids=${recommendedIds.join(",")}`
      );

      console.log("📦 CollabRecs: Got blog metadata for", blogsData.length, "blogs");

      const enriched = blogsData.map((blog) => ({
        ...blog,
        similarityScore: scoreMap[blog._id] || 0,
      }));

      enriched.sort((a, b) => b.similarityScore - a.similarityScore);

      console.log("✅ CollabRecs: Setting", enriched.length, "blogs to state");
      setRecommendedBlogs(enriched);
      setPage(0); // reset pagination
    } catch (error) {
      console.error("❌ CollabRecs Error:", error);
      setRecommendedBlogs([]);
      setNoRecs(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchRecommendations();
  }, [userId, refreshTrigger]);

  // Callback to refresh recommendations when user likes/unlikes
  const handleLikeChange = () => {
    console.log("🔄 CollabRecs: Like changed, refreshing in 1000ms...");
    // Add delay to ensure database is updated
    setTimeout(() => {
      console.log("🔄 CollabRecs: Now fetching updated recommendations...");
      fetchRecommendations();
    }, 1000);
  };

  if (!userId) return null;

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
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
        <FontAwesomeIcon icon={faBrain} /> You May Also Like
      </h2>

      {loading ? (
        <p style={{ color: "#888", fontStyle: "italic" }}>Loading recommendations...</p>
      ) : noRecs ? (
        <p style={{ color: "#999", fontStyle: "italic" }}>
          No personalized recommendations yet.
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
              <div key={blog._id}>
                <BlogCard blog={blog} currentUserId={userId} compact={true} onLikeChange={handleLikeChange} />
                <p style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>
                  🔍 Similarity Score: {blog.similarityScore.toFixed(3)}
                </p>
              </div>
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

export default CollaborativeRecommendations;