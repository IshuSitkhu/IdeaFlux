import React from "react";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.8rem 2rem",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2274a1" }}>
        Admin Panel
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontWeight: "600", color: "#2274a1" }}>
          {user?.name || "Admin"}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "#d50707ff",
            border: "none",
            fontWeight: 500,
            fontSize: "1rem",
            color: "white",
            cursor: "pointer",
            transition: "background 0.2s",
            borderRadius: "50px",
            padding: "6px 12px",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#f25757ff")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#d50707ff")}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
