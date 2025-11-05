

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as solidHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import BlogCard from "../components/BlogCard";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  const [blog, setBlog] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [showComments, setShowComments] = useState(false);

  // Scroll to top and hide comments when blog changes
  useEffect(() => {
    // The MainLayout's .page-content div is the scrollable container
    const pageContent = document.querySelector('.page-content');

    if (pageContent) {
      // Scroll the actual scrollable container
      pageContent.scrollTo(0, 0);
      pageContent.scrollTop = 0;
    }

    // Also scroll window (in case layout changes)
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Hide comments when navigating to new blog
    setShowComments(false);
  }, [id]);

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/blog/${id}`);
        setBlog(res.data);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error("Error fetching blog:", err);
      }
    };

    fetchBlog();
  }, [id]);

  // Fetch like status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/likes/status/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLiked(res.data.liked);
        setLikeCount(res.data.totalLikes);
      } catch (err) {
        console.error("Error fetching like status:", err);
      }
    };

    if (token) fetchLikeStatus();
  }, [id, token]);

  // Fetch related blogs by category
  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/blog/related/${id}`
        );
        setRelatedBlogs(res.data.relatedBlogs || []);
      } catch (err) {
        console.error("Error fetching related blogs:", err);
      }
    };

    fetchRelatedBlogs();
  }, [id]);

  const handleLike = async () => {
    if (!token) {
      toast.info("Please login to like the blog.");
      navigate("/register");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/likes/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(res.data.liked);
      setLikeCount(res.data.totalLikes);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.info("Session expired. Please login again.");
        navigate("/register");
      } else {
        console.error("Error liking blog:", err);
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/register");
      return;
    }

    if (!newComment.trim()) {
      toast.warning("Please write a comment first!");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/blog/${id}/comment`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.comment) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment("");
        toast.success("Comment posted!");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/register");
      } else {
        console.error("Error submitting comment:", err);
        toast.error("Failed to post comment");
      }
    }
  };

  if (!blog) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          fontSize: "1.2rem",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f9fafb, #ffffff)",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header Section */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "2.5rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            marginBottom: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              color: "#1f2937",
              lineHeight: "1.3",
            }}
          >
            {blog.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem",
              paddingBottom: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <p style={{ fontSize: "1rem", color: "#6b7280", margin: 0 }}>
              By <strong style={{ color: "#2274a1" }}>{blog.author?.name || "Unknown"}</strong>
            </p>
            <span style={{ color: "#d1d5db" }}>•</span>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af", margin: 0 }}>
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {blog.categories && blog.categories.length > 0 && (
              <>
                <span style={{ color: "#d1d5db" }}>•</span>
                <div
                  style={{
                    display: "flex",
                    gap: "0.4rem",
                    flexWrap: "wrap",
                  }}
                >
                  {blog.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "#e0f2fe",
                        color: "#0369a1",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: "500",
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {blog.image && (
            <img
              src={blog.image}
              alt="blog cover"
              style={{
                width: "100%",
                maxHeight: "450px",
                objectFit: "cover",
                borderRadius: "12px",
                marginBottom: "2rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          )}

          <div
            style={{
              fontSize: "1.125rem",
              lineHeight: "1.8",
              color: "#374151",
              marginBottom: "1.5rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {blog.content}
          </div>

          {/* Like & Comment Buttons */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <button
              onClick={handleLike}
              style={{
                background: liked ? "#fee2e2" : "#f3f4f6",
                border: "none",
                color: liked ? "#dc2626" : "#4b5563",
                fontSize: "1.1rem",
                cursor: "pointer",
                padding: "0.75rem 1.5rem",
                borderRadius: "12px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
              }}
            >
              <FontAwesomeIcon icon={liked ? solidHeart : regularHeart} /> Like ({likeCount})
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              style={{
                background: showComments ? "#e0f2fe" : "#f3f4f6",
                border: "none",
                color: showComments ? "#0369a1" : "#4b5563",
                fontSize: "1.1rem",
                cursor: "pointer",
                padding: "0.75rem 1.5rem",
                borderRadius: "12px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
              }}
            >
              <FontAwesomeIcon icon={faComment} /> Comments ({comments.length})
            </button>
          </div>
        </div>

        {/* Comments Section - Toggle Visibility */}
        {showComments && (
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "1.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              marginBottom: "2rem",
              animation: "slideDown 0.3s ease",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "#1f2937",
              }}
            >
              Comments ({comments.length})
            </h3>

            <form onSubmit={handleCommentSubmit} style={{ marginBottom: "1.5rem" }}>
              <textarea
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  marginBottom: "0.75rem",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2274a1")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                type="submit"
                style={{
                  background: "#2274a1",
                  color: "#fff",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "500",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#1e5f8a";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#2274a1";
                }}
              >
                Post Comment
              </button>
            </form>

            <div style={{ marginTop: "1rem" }}>
              {comments.length === 0 ? (
                <p
                  style={{
                    color: "#9ca3af",
                    fontStyle: "italic",
                    textAlign: "center",
                    padding: "1rem",
                    margin: 0,
                    fontSize: "0.9rem",
                  }}
                >
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      borderBottom: i < comments.length - 1 ? "1px solid #f3f4f6" : "none",
                      padding: "0.75rem 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #2274a1, #10b981)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: "600",
                          fontSize: "0.85rem",
                        }}
                      >
                        {(c.user?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <strong style={{ color: "#1f2937", fontSize: "0.9rem" }}>
                        {c.user?.name || "User"}
                      </strong>
                    </div>
                    <p
                      style={{
                        color: "#4b5563",
                        fontSize: "0.9rem",
                        lineHeight: "1.5",
                        marginLeft: "2.5rem",
                        margin: "0 0 0 2.5rem",
                      }}
                    >
                      {c.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add CSS animation */}
            <style>{`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        )}

        {/* Related Blogs Section */}
        {relatedBlogs.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#1f2937",
              }}
            >
              You might also like
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.95rem",
                marginBottom: "2rem",
              }}
            >
              Based on content similarity
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 320px))",
                gap: "1.5rem",
                justifyContent: "start",
              }}
            >
              {relatedBlogs.map((relatedBlog) => (
                <BlogCard
                  key={relatedBlog._id}
                  blog={relatedBlog}
                  currentUserId={currentUserId}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
