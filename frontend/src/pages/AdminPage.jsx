import React from "react";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "24px", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px", color: "#1f2937" }}>
        Welcome, Admin!
      </h1>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {/* Users */}
        <div style={{
          flex: "1 1 200px",
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Users</h2>
          <button
            onClick={() => navigate("/admin/users")}
            style={{
              padding: "8px 16px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Manage Users
          </button>
        </div>

        {/* Blogs */}
        <div style={{
          flex: "1 1 200px",
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Blogs</h2>
          <button
            onClick={() => navigate("/admin/blogs")}
            style={{
              padding: "8px 16px",
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Manage Blogs
          </button>
        </div>

        {/* Categories */}
        <div style={{
          flex: "1 1 200px",
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Categories</h2>
          <button
            onClick={() => navigate("/admin/categories")}
            style={{
              padding: "8px 16px",
              background: "#f59e0b",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Manage Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
