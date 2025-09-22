import React, { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "./BlogCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain } from "@fortawesome/free-solid-svg-icons";

const CollaborativeRecommendations = ({ userId }) => {
  const [recommendedBlogs, setRecommendedBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noRecs, setNoRecs] = useState(false);
  const [page, setPage] = useState(0);

  const blogsPerPage = 3;
  const totalPages = Math.ceil(recommendedBlogs.length / blogsPerPage);
  const startIndex = page * blogsPerPage;
  const visibleBlogs = recommendedBlogs.slice(startIndex, startIndex + blogsPerPage);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setNoRecs(false);
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL;

        const { data: recData } = await axios.get(`${API_BASE}/blog/recommend-collab`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const recommendations = (recData.recommendations || []).filter((r) => r.score > 0);
        if (recommendations.length === 0) {
          setRecommendedBlogs([]);
          setNoRecs(true);
          return;
        }

        const recommendedIds = recommendations.map((r) => r.blogId);
        const scoreMap = Object.fromEntries(recommendations.map((r) => [r.blogId, r.score]));

        const { data: blogsData } = await axios.get(
          `${API_BASE}/blog/metadata?ids=${recommendedIds.join(",")}`
        );

        const enriched = blogsData.map((blog) => ({
          ...blog,
          similarityScore: scoreMap[blog._id] || 0,
        }));

        enriched.sort((a, b) => b.similarityScore - a.similarityScore);

        setRecommendedBlogs(enriched);
        setPage(0); // reset pagination
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendedBlogs([]);
        setNoRecs(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchRecommendations();
  }, [userId]);

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
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "16px",
            }}
          >
            {visibleBlogs.map((blog) => (
              <div key={blog._id}>
                <BlogCard blog={blog} currentUserId={userId} compact={true} />
                <p style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>
                  🔍 Similarity Score: {blog.similarityScore.toFixed(3)}
                </p>
              </div>
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
                borderRadius: "6px",
                backgroundColor: page === 0 ? "#eee" : "black",
                color: page === 0 ? "#aaa" : "#fff",
                cursor: page === 0 ? "not-allowed" : "pointer",
                border: "1px solid #ccc",
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
                borderRadius: "6px",
                backgroundColor: page >= totalPages - 1 ? "#eee" : "black",
                color: page >= totalPages - 1 ? "#aaa" : "#fff",
                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                border: "1px solid #ccc",
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

export default CollaborativeRecommendations;
