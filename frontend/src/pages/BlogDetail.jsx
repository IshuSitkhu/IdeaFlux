

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [blog, setBlog] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

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

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/blog/${id}/comment`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.comment) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment("");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/register");
      } else {
        console.error("Error submitting comment:", err);
      }
    }
  };

  if (!blog) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{blog.title}</h1>

      <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
        By: <strong>{blog.author?.name || "Unknown"}</strong>
      </p>

      {blog.image && (
        <img
          src={blog.image}
          alt="blog cover"
          style={{
            width: "100%",
            maxHeight: 400,
            objectFit: "cover",
            marginBottom: "1rem",
            borderRadius: 8,
          }}
        />
      )}

      <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>{blog.content}</p>

      <p style={{ fontSize: 15, color: "#555", fontStyle: "italic", marginTop: 12 }}>
        <strong>Category:</strong> {blog.categories?.join(", ")}
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        <button
          onClick={handleLike}
          style={{
            background: "none",
            border: "none",
            color: liked ? "red" : "#333",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          <FontAwesomeIcon icon={liked ? solidHeart : regularHeart} /> Like ({likeCount})
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Comments</h3>

        <form onSubmit={handleCommentSubmit} style={{ marginTop: 12 }}>
          <textarea
            rows="3"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
              marginBottom: 10,
            }}
          />
          <button
            type="submit"
            style={{
              background: "#2274a1",
              color: "#fff",
              padding: "8px 16px",
              border: "none",
              borderRadius: 6,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Post Comment
          </button>
        </form>

        <div style={{ marginTop: "1rem" }}>
          {comments.length === 0 ? (
            <p style={{ color: "#888", fontStyle: "italic" }}>No comments yet.</p>
          ) : (
            comments.map((c, i) => (
              <div
                key={i}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px 0",
                }}
              >
                <strong>{c.user?.name || "User"}:</strong> {c.text}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
