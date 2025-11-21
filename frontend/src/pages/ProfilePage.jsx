import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userBlogs, setUserBlogs] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const userId = userData._id || userData.id;
    if (!userId) {
      navigate("/login");
      return;
    }

    setUser(userData);

    const fetchUserBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/blog/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setUserBlogs(data.blogs || []);
      } catch (err) {
        console.error("Failed to fetch user blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBlogs();
  }, [navigate]);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: "2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#222",
      }}
    >
      {/* User info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#2274a1",
            color: "white",
            borderRadius: "50%",
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            fontSize: "1.5rem",
            textTransform: "uppercase",
            boxShadow: "0 0 8px rgba(79, 70, 229, 0.6)",
            userSelect: "none",
          }}
        >
          {user?.name?.charAt(0) || "U"}
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            margin: 0,
            color: "#333",
          }}
        >
          {user?.name}'s Profile
        </h1>
      </div>

      <hr
        style={{
          border: "none",
          height: 1,
          backgroundColor: "#e5e7eb",
          marginBottom: "2rem",
        }}
      />

      <h2 style={{ marginBottom: "1.5rem", color: "#2274a1" }}>Your Posts</h2>

      {loading ? (
        <p
          style={{
            fontSize: "1.1rem",
            color: "#666",
            fontStyle: "italic",
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          Loading your blogs...
        </p>
      ) : userBlogs.length === 0 ? (
        <p
          style={{
            fontSize: "1.1rem",
            color: "#666",
            fontStyle: "italic",
            textAlign: "center",
            marginTop: "2rem",
          }}
        >
          You haven't posted any blogs yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {userBlogs.map((blog) => (
            <div
              key={blog._id}
              onClick={() => navigate(`/blog/${blog._id}`)}
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                boxShadow:
                  "0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
                padding: "1.2rem 1.5rem",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 140,
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 24px rgba(79, 70, 229, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)";
              }}
            >
              {/* 👇 Show image if exists 👇 */}
              {blog.image && (
                <img
                  src={blog.image}
                  alt={blog.title}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    marginBottom: "12px",
                  }}
                />
              )}

              {/* DELETE BUTTON */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (
                    window.confirm("Are you sure you want to delete this blog?")
                  ) {
                    const token = localStorage.getItem("token");
                    try {
                      const res = await fetch(
                        `${import.meta.env.VITE_API_BASE_URL}/blog/${blog._id}`,
                        {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                      if (res.ok) {
                        setUserBlogs((prev) =>
                          prev.filter((b) => b._id !== blog._id)
                        );
                      } else {
                        alert("Failed to delete blog.");
                      }
                    } catch (error) {
                      console.error("Delete error:", error);
                      alert("Something went wrong.");
                    }
                  }
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  userSelect: "none",
                }}
                title="Delete blog"
                aria-label="Delete blog"
              >
                <FontAwesomeIcon icon={faTrash} style={{ fontSize: "16px" }} />
              </button>

              {/* EDIT BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/update-blog/${blog._id}`);
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 44,
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  userSelect: "none",
                }}
                title="Edit blog"
                aria-label="Edit blog"
              >
                ✏️
              </button>

              <h3
                style={{
                  margin: "0 0 0.6rem 0",
                  fontWeight: "700",
                  color: "#1f2937",
                  fontSize: "1.2rem",
                  lineHeight: "1.3",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={blog.title}
              >
                {blog.title}
              </h3>
              <p
                style={{
                  flexGrow: 1,
                  margin: "0 0 1rem 0",
                  color: "#4b5563",
                  fontSize: "0.95rem",
                  lineHeight: "1.4",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
                title={blog.content}
              >
                {blog.content}
              </p>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  userSelect: "none",
                }}
              >
                <span>👍 {blog.likes?.length || 0}</span>
                <span>💬 {blog.comments?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
