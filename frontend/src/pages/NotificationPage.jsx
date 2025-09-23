import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/notification/${currentUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    if (token && currentUser?.id) {
      fetchNotifications();
    }
  }, []);

  const goToSenderProfile = (senderId) => {
    navigate(`/user/${senderId}`);
  };

  // ✅ Updated to use isRead
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "20px 32px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "#facc15",
            borderRadius: "50%",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(250,204,21,0.3)",
          }}
        >
          <FaBell size={22} color="#fff" />
        </div>
        <h2
          style={{
            margin: 0,
            marginLeft: 16,
            fontWeight: 700,
            fontSize: 22,
            color: "#111827",
          }}
        >
          Notifications
        </h2>
      </div>

      {/* Notification List */}
      <div
        style={{
          flex: 1,
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {notifications.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#6b7280",
              fontSize: 16,
              marginTop: 60,
              fontWeight: 500,
            }}
          >
            No notifications yet 🎉
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              style={{
                background: n.isRead ? "#ffffff" : "#f0f9ff", // ✅ Updated
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "16px 20px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onClick={() => {
                if ((n.type === "like" || n.type === "comment") && n.blogId) {
                  navigate(`/blog/${n.blogId}`);
                }
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)")
              }
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSenderProfile(n.sender._id);
                    }}
                    style={{
                      color: "#2274a1",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {n.sender?.name}
                  </span>{" "}
                  <span style={{ color: "#374151" }}>
                    {n.type === "follow" ? "followed you" : n.message}
                  </span>
                </div>
                <small style={{ color: "#6b7280", fontSize: 13 }}>
                  {new Date(n.createdAt).toLocaleTimeString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
