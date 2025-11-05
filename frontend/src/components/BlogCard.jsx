import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { Heart, MessageCircle, Plus, User, Calendar, Tag } from "lucide-react";

const BlogCard = ({ blog, compact = false, currentUserId, onLikeChange }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState(blog.comments || []);
  const [newComment, setNewComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch like status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/likes/status/${blog._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Like status response:", res.data); // <--- check this in console
        setLiked(res.data.liked);
        setLikeCount(res.data.totalLikes);
      } catch (err) {
        console.error("Error fetching like status:", err);
      }
    };

    if (token) fetchLikeStatus();
  }, [blog._id, token]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!token) {
      toast.info("Please register or login to like blogs.");
      navigate("/register");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/likes/${blog._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(res.data.liked);
      setLikeCount(res.data.totalLikes);

      // Trigger refresh in parent component if callback provided
      if (onLikeChange) {
        console.log("✅ BlogCard: Like successful, calling onLikeChange callback");
        onLikeChange();
      } else {
        console.log("⚠️ BlogCard: No onLikeChange callback provided");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.info("Session expired. Please login again.");
        navigate("/register");
      } else {
        console.error("Like error:", err);
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!token) {
      navigate("/register");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/blog/${blog._id}/comment`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.comment) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment("");
        setShowComments(true);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/register");
      } else {
        console.error("Comment error:", err);
      }
    }
  };

  const handleAvatarClick = () => {
    navigate(`/user/${blog.author._id}`);
  };

  const truncateLength = compact ? 70 : 250;
  const truncatedContent =
    blog.content.length > truncateLength
      ? `${blog.content.substring(0, truncateLength)}...`
      : blog.content;

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "20px",
  };

  const cardHoverStyle = {
    ...cardStyle,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    transform: "translateY(-2px)",
  };

  const headerStyle = {
    padding: "24px 24px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  };

  const authorStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const avatarStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2274a1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
  };

  const authorNameStyle = {
    fontWeight: "500",
    color: "#111827",
    fontSize: "16px",
    margin: 0,
  };

  const dateStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#6b7280",
    fontSize: "12px",
    marginTop: "4px",
  };

  const categoryStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#f9fafb",
    padding: "4px 8px",
    borderRadius: "16px",
    fontSize: "12px",
    color: "#6b7280",
  };

  const titleStyle = {
    fontSize: compact ? "18px" : "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "12px",
    lineHeight: "1.3",
    padding: "0 24px",
  };

  const imageStyle = {
    width: "100%",
    height: compact ? "128px" : "192px",
    objectFit: "cover",
    margin: "0 24px 16px",
    borderRadius: "8px",
    maxWidth: "calc(100% - 48px)",
  };

  const contentStyle = {
    padding: "0 24px 16px",
    color: "#374151",
    fontSize: compact ? "14px" : "16px",
    lineHeight: "1.6",
  };

  const readMoreStyle = {
    color: "#2274a1",
    fontWeight: "500",
    marginLeft: "4px",
    cursor: "pointer",
    textDecoration: "none",
  };

  const actionsStyle = {
    padding: "16px 24px",
    borderTop: "1px solid #f3f4f6",
    backgroundColor: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const buttonGroupStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "14px",
    fontWeight: "500",
  };

  const likeButtonStyle = {
    ...buttonStyle,
    color: liked ? "#dc2626" : "#6b7280",
    backgroundColor: liked ? "#fef2f2" : "transparent",
  };

  const commentButtonStyle = {
    ...buttonStyle,
    color: "#6b7280",
  };

  const addCommentButtonStyle = {
    ...buttonStyle,
    color: "#6b7280",
  };

  const commentFormStyle = {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: "12px",
  };

  const commentInputStyle = {
    flex: 1,
    padding: "8px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const postButtonStyle = {
    padding: "8px 16px",
    backgroundColor: "#2274a1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "8px",
  };

  const commentsStyle = {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
  };

  const commentStyle = {
    display: "flex",
    gap: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "12px",
  };

  const commentAvatarStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6b7280, #9ca3af)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "12px",
    flexShrink: 0,
  };

  const commentContentStyle = {
    flex: 1,
  };

  const commentHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  };

  const commentAuthorStyle = {
    fontWeight: "500",
    color: "#111827",
    fontSize: "14px",
  };

  const commentDateStyle = {
    color: "#6b7280",
    fontSize: "12px",
  };

  const commentTextStyle = {
    color: "#374151",
    fontSize: "14px",
    lineHeight: "1.5",
  };

  const [isHovered, setIsHovered] = useState(false);

  console.log("Blog:", blog);

  return (
    <article
      style={isHovered ? cardHoverStyle : cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div style={headerStyle}>
        <div style={authorStyle}>
          <div style={avatarStyle} onClick={handleAvatarClick}>
            {blog.author?.name?.charAt(0) || <User size={16} />}
          </div>
          <div onClick={handleAvatarClick}>
            <h4 style={authorNameStyle}>
              {blog.author?.name || "Unknown Author"}
            </h4>
            <div style={dateStyle}>
              <Calendar size={12} />
              {new Date(blog.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>

        {blog.categories && blog.categories.length > 0 && (
          <div style={categoryStyle}>
            <Tag size={12} />
            {blog.categories[0]}
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        onClick={() => {
          if (!token) {
            toast.info("Please login to view blog details.");
            navigate("/register");
          } else {
            navigate(`/blog/${blog._id}`);
          }
        }}
        style={titleStyle}
      >
        {blog.title}
      </h3>

      {/* Image */}
      {blog.image && (
        <img
          onClick={() => {
            if (!token) {
              toast.info("Please login to view blog details.");
              navigate("/register");
            } else {
              navigate(`/blog/${blog._id}`);
            }
          }}
          src={blog.image}
          alt={blog.title}
          style={imageStyle}
        />
      )}

      {/* Content */}
      <div style={contentStyle}>
        <p style={{ margin: 0 }}>
          {truncatedContent}
          {blog.content.length > truncateLength && (
            <span
              style={readMoreStyle}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/blog/${blog._id}`);
              }}
            >
              Read more
            </span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div style={actionsStyle} onClick={(e) => e.stopPropagation()}>
        <div style={buttonGroupStyle}>
          <button
            onClick={handleLike}
            style={likeButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = liked ? "#fee2e2" : "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = liked
                ? "#fef2f2"
                : "transparent";
            }}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            {likeCount}
          </button>

          <button
            onClick={() => setShowComments((prev) => !prev)}
            style={commentButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <MessageCircle size={16} />
            {comments.length}
          </button>
        </div>

        <button
          onClick={() => setShowCommentInput((prev) => !prev)}
          style={addCommentButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f3f4f6";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          <Plus size={16} />
          Comment
        </button>
      </div>

      {/* Add Comment Form */}
      {showCommentInput && (
        <div style={commentFormStyle}>
          <div style={commentAvatarStyle}> {user?.name?.charAt(0) || "U"}</div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              style={commentInputStyle}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCommentSubmit();
                }
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#2274a1";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
              }}
            />
            <button
              onClick={handleCommentSubmit}
              style={postButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#2274a1";
              }}
            >
              Post Comment
            </button>
          </div>
        </div>
      )}

      {/* Show Comments */}
      {showComments && (
        <div style={commentsStyle}>
          {comments.length === 0 ? (
            <p
              style={{
                color: "#6b7280",
                fontStyle: "italic",
                textAlign: "center",
                padding: "16px 0",
                margin: 0,
              }}
            >
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((c, i) => (
              <div key={i} style={commentStyle}>
                <div style={commentAvatarStyle}>
                  {c.user?.name?.charAt(0) || "U"}
                </div>
                <div style={commentContentStyle}>
                  <div style={commentHeaderStyle}>
                    <span style={commentAuthorStyle}>
                      {c.user?.name || "User"}
                    </span>
                    <span style={commentDateStyle}>
                      {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={commentTextStyle}>{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </article>
  );
};

export default BlogCard;