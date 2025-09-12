import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, blogs: 0 });

  useEffect(() => {
    // Fetch stats from backend
    const fetchStats = async () => {
      try {
        const resUsers = await fetch("http://localhost:8000/api/admin/users/count");
        const usersData = await resUsers.json();

        const resBlogs = await fetch("http://localhost:8000/api/admin/blogs/count");
        const blogsData = await resBlogs.json();

        setStats({ users: usersData.count, blogs: blogsData.count });
      } catch (err) {
        console.error(err);
        alert("Error fetching stats.");
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: "24px", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px", color: "#1f2937" }}>
        Welcome, Admin!
      </h1>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {/* Total Users */}
        <div style={{
          flex: "1 1 200px",
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Total Users</h2>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#2563eb" }}>{stats.users}</p>
          <button
            onClick={() => navigate("/admin/users")}
            style={{
              marginTop: "12px",
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

        {/* Total Blogs */}
        <div style={{
          flex: "1 1 200px",
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>Total Blogs</h2>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#16a34a" }}>{stats.blogs}</p>
          <button
            onClick={() => navigate("/admin/blogs")}
            style={{
              marginTop: "12px",
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
      </div>
    </div>
  );
};

export default AdminPage;
