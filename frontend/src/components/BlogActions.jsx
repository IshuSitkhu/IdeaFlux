"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Heart, MessageCircle, Plus } from "lucide-react";
import { toast } from "react-toastify";

const BlogActions = ({ blogId, currentUserId, onLikeChange, comments: initialComments = [], user }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState("");
  const token = localStorage.getItem("token");

  // FETCH LIKE STATUS
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/likes/status/${blogId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setLiked(res.data.liked);
        setLikeCount(res.data.totalLikes);
      } catch (err) {
        console.error("Like status error:", err);
      }
    };

    if (token) fetchStatus();
  }, [blogId, token]);

  // HANDLE LIKE CLICK
  const handleLike = async (e) => {
    e.stopPropagation();

    if (!token) {
      toast.info("Please login to like posts.");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/likes/${blogId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLiked(res.data.liked);
      setLikeCount(res.data.totalLikes);

      if (onLikeChange) onLikeChange();
    } catch (err) {
      console.error("Like Error:", err);
    }
  };

  // HANDLE COMMENT SUBMIT
  const handleCommentSubmit = async (text, callback) => {
    if (!token) {
      toast.info("Please login to comment.");
      return;
    }

    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/comments/${blogId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) => [...prev, res.data]);
      setNewComment("");
      if (callback) callback();
    } catch (err) {
      console.error("Comment Error:", err);
    }
  };

  return (
    <div style={{ marginTop: "10px" }} onClick={(e) => e.stopPropagation()}>
      {/* ACTION BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 0",
        }}
      >
        <div style={{ display: "flex", gap: "14px" }}>
          {/* LIKE BUTTON */}
          <button
            onClick={handleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "none",
              padding: "6px 12px",
              background: liked ? "#fee2e2" : "#f3f4f6",
              cursor: "pointer",
              borderRadius: "6px",
              color: liked ? "#dc2626" : "#555",
              fontWeight: 600,
            }}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            {likeCount}
          </button>

          {/* SHOW COMMENTS BUTTON */}
          <button
            onClick={() => setShowComments((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "none",
              padding: "6px 12px",
              background: "transparent",
              cursor: "pointer",
              borderRadius: "6px",
              color: "#555",
              fontWeight: 600,
            }}
          >
            <MessageCircle size={16} /> {comments.length}
          </button>
        </div>

        {/* ADD COMMENT BUTTON */}
        <button
          onClick={() => setShowCommentInput((prev) => !prev)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: "6px",
          }}
        >
          <Plus size={16} /> Comment
        </button>
      </div>

      {/* COMMENT INPUT */}
      {showCommentInput && user && (
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "#ddd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            {user?.name?.charAt(0) || "U"}
          </div>

          <div style={{ flex: 1 }}>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCommentSubmit(newComment);
              }}
            />

            <button
              style={{
                marginTop: "6px",
                padding: "6px 12px",
                background: "#2274a1",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              onClick={() => handleCommentSubmit(newComment)}
            >
              Post Comment
            </button>
          </div>
        </div>
      )}

      {/* SHOW COMMENTS */}
      {showComments && (
        <div style={{ marginTop: "12px", paddingLeft: "10px" }}>
          {comments.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#666" }}>No comments yet.</p>
          ) : (
            comments.map((c, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "#eee",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {c.user?.name?.charAt(0)}
                </div>

                <div>
                  <strong>{c.user?.name}</strong>
                  <p style={{ margin: 0 }}>{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BlogActions;
