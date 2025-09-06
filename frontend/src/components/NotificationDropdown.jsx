import React, { useEffect, useState } from "react"; 
import axios from "axios";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
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
    if (token && currentUser?.id) fetchNotifications();

    socket.emit("joinRoom", currentUser?.id);

    socket.on("newNotification", (notification) => {
      console.log("New notification received:", notification);
      setNotifications((prev) => [{ ...notification, isNew: true }, ...prev]);
      setToast(notification);
      setTimeout(() => setToast(null), 4000);
    });

    return () => socket.off("newNotification");
  }, []);

  // ✅ handleBellClick updated to use isRead
  const handleBellClick = async () => {
    setOpen(!open);

    if (!open) {
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      if (unreadCount > 0) {
        try {
          await axios.post(
            `http://localhost:8000/api/notification/mark-read/${currentUser.id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setNotifications((prev) =>
            prev.map((n) => ({ ...n, isRead: true }))
          );
        } catch (err) {
          console.error("Error marking notifications as read", err);
        }
      }
    }
  };

  const handleNotificationClick = (notification) => {
    if ((notification.type === "like" || notification.type === "comment") && notification.blogId) {
      navigate(`/blog/${notification.blogId}`);
    } else if (notification.type === "follow") {
      navigate(`/user/${notification.sender._id}`);
    } else {
      console.error("Invalid notification type or missing blogId:", notification);
      alert("Unable to navigate to the notification target.");
    }
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Bell Icon */}
      <div
        onClick={handleBellClick}
        style={{ position: "relative", cursor: "pointer" }}
      >
        <FaBell size={28} style={{ color: "#facc15" }} />
        {notifications.filter((n) => !n.isRead).length > 0 && (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              padding: "3px 7px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "35px",
            right: 0,
            width: "300px",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
            borderRadius: "12px",
            zIndex: 100,
            padding: "10px 0",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              padding: "0 15px",
              marginBottom: 10,
            }}
          >
            Notifications
          </h4>
          {notifications.length === 0 ? (
            <p
              style={{
                fontSize: "14px",
                color: "#888",
                padding: "0 15px",
              }}
            >
              No new notifications
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px 15px",
                  margin: "0 10px 5px 10px",
                  borderRadius: "10px",
                  backgroundColor: n.isRead ? "#f3f4f6" : "#e0f2fe",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <span>
                  <strong
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${n.sender._id}`);
                    }}
                    style={{
                      color: "#2563eb",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {n.sender?.name}
                  </strong>{" "}
                  <span style={{ color: "#374151" }}>
                    {n.type === "follow" ? "followed you" : n.message}
                  </span>
                </span>
                <span style={{ fontSize: "12px", color: "#888" }}>
                  {new Date(n.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
