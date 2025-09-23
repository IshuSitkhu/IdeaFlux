import React, { useState } from "react";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import { toast } from "react-toastify";

const RecommendPage = () => {
  const [inputTitle, setInputTitle] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  const fetchRecommendations = async (title) => {
    if (!title.trim()) return;
    try {
      setLoading(true);
      const encodedTitle = encodeURIComponent(title.trim());
      const res = await axios.get(
        `http://localhost:8000/api/blog/recommend-content/${encodedTitle}`
      );
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error("Recommendation fetch failed", err);
      toast.error("Something went wrong while fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchRecommendations(inputTitle);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem 1rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          color: "#D97706",
          textAlign: "center",
        }}
      >
        Blog Recommendations
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2rem",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Enter blog title or keyword"
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "0.6rem 1rem",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            fontSize: "1rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.2)")
          }
          onBlur={(e) =>
            (e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)")
          }
        />
        <button
          onClick={() => fetchRecommendations(inputTitle)}
          disabled={loading}
          style={{
            backgroundColor: "#2274a1",
            color: "#fff",
            padding: "0.6rem 1.5rem",
            borderRadius: "12px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "1rem",
            minWidth: "160px",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#2274a1e7";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#2274a1";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.3)";
          }}
        >
          {loading ? "Searching..." : "Recommend"}
        </button>
      </div>

      {/* Recommendation grid */}
      {recommendations.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            transition: "all 0.3s ease",
          }}
        >
          {recommendations.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              currentUserId={currentUserId}
              compact={true}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <p
            style={{
              color: "#6B7280",
              textAlign: "center",
              marginTop: "3rem",
              fontSize: "1.1rem",
            }}
          >
            No recommendations found. Try searching again.
          </p>
        )
      )}
    </div>
  );
};

export default RecommendPage;
