"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import BlogActions from "../components/BlogActions";
import { Tag, Calendar } from "lucide-react";

const RecommendPage = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch recommended blogs based on current blog
  const fetchRecommendations = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.get(`${API_BASE}/blog/${blogId}/recommendations`);
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    }
  };

  useEffect(() => {
    if (user?.id) setCurrentUserId(user.id);
    fetchRecommendations();
  }, [blogId]);

  const handleLikeChange = () => {
    // Refresh recommendations after like
    setTimeout(() => {
      fetchRecommendations();
    }, 500);
  };

  return (
    <div style={{ maxWidth: 1300, margin: "20px auto", padding: "0 20px" }}>
      <h1 style={{ fontWeight: "400", marginBottom: "24px", color: "#2274a1" }}>
        Blogs Related to This Post
      </h1>

      {recommendations.length === 0 ? (
        <p style={{ fontStyle: "italic", color: "#666" }}>No recommendations available.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {recommendations.map((blog) => (
            <div
              key={blog._id}
              onClick={() => navigate(`/blog/${blog._id}`)}
              style={{
                cursor: "pointer",
                background: "#fff",
                padding: "1rem",
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                border: "1px solid #e5e7eb",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                {/* LEFT — TEXT */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                    {blog.title}
                  </h3>

                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#666", margin: 0 }}>
                    By {blog.author?.name || "Unknown Author"}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Category */}
                    {blog.categories?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          backgroundColor: "#f3f4f6",
                          padding: "4px 10px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          color: "#555",
                        }}
                      >
                        <Tag size={12} /> {blog.categories[0]}
                      </div>
                    )}

                    {/* Date */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: "#777",
                      }}
                    >
                      <Calendar size={12} />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Blog excerpt */}
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#444",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {blog.content?.slice(0, 140)}...
                  </p>

                  {/* Actions */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <BlogActions
                      blogId={blog._id}
                      currentUserId={currentUserId}
                      onLikeChange={handleLikeChange}
                      comments={blog.comments || []}
                      user={user}
                    />
                  </div>
                </div>

                {/* RIGHT — IMAGE */}
                {blog.image && (
                  <img
                    src={blog.image}
                    alt="blog"
                    style={{
                      width: "150px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendPage;
