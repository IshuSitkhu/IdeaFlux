import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminUserForm from "../components/AdminUserForm";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("You must be logged in as admin.");
      navigate("/login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "Failed to fetch users");

        const sortedUsers = (body.users || []).sort((a, b) => {
          if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
          return b._id.localeCompare(a._id);
        });

        setUsers(sortedUsers);
      } catch (err) {
        console.error("Fetch users error:", err);
        alert("Error fetching users: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, navigate]);

  const showError = (body) => {
    if (!body) return alert("Unknown error");
    if (typeof body.message === "string") return alert(body.message);
    if (typeof body.message === "object") {
      const messages = Object.values(body.message).join("\n");
      return alert(messages);
    }
    alert(JSON.stringify(body));
  };

  const handleAddUser = async (form) => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/users", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) return showError(body);

      setUsers((prev) => [body.user, ...prev]);
      setShowForm(false);
    } catch (err) {
      alert("Error adding user: " + err.message);
    }
  };

  const handleUpdateUser = async (user, form) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) return showError(body);

      setUsers((prev) => prev.map((u) => (u._id === user._id ? body.user : u)));
      setEditUser(null);
    } catch (err) {
      alert("Error updating user: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Delete failed");
      setUsers((prev) => prev.filter((u) => u._id !== id));
      alert(body.message || "User deleted successfully");
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  if (loading) return <p style={{ padding: 20 }}>Loading users...</p>;

  // Styling helpers
  const actionBtnStyle = (bgColor) => ({
    marginRight: 6,
    padding: "6px 12px",
    backgroundColor: bgColor,
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    width:"70px",
    marginBottom:6,
  });

  const paginationBtnStyle = (disabled) => ({
    padding: "8px 12px",
    backgroundColor: disabled ? "#d1d5db" : "#3b82f6",
    color: disabled ? "#6b7280" : "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : "0 2px 5px rgba(0,0,0,0.1)",
    transition: "all 0.2s",
    width:"100px",
  });

  return (
    <div style={{ padding: 20, minHeight: "100vh", backgroundColor: "#f0f4f8", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: 20, color: "#1f2937" }}>Admin Panel - Manage Users</h1>

      {showForm && <AdminUserForm onSubmit={handleAddUser} onCancel={() => setShowForm(false)} />}
      {editUser && <AdminUserForm user={editUser} onSubmit={(form) => handleUpdateUser(editUser, form)} onCancel={() => setEditUser(null)} />}

      {!showForm && !editUser && (
        <button
          onClick={() => setShowForm(true)}
          style={{
                width: "100%",
                padding: "14px 0",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "15px",
                transition: "all 0.3s ease",
                boxShadow: "0 3px 8px rgba(37,99,235,0.3)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
        >
          ➕ Add New User
        </button>
      )}

      {/* Responsive table wrapper */}
      <div style={{ overflowX: "auto", marginTop: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          <thead style={{ fontSize:22 }}>
            <tr>
              <th style={{ padding: 14, textAlign: "left", fontWeight: "bold", color: "#1e3a8a" }}>SN</th>
              <th style={{ padding: 14, textAlign: "left", fontWeight: "bold", color: "#1e3a8a" }}>Name</th>
              <th style={{ padding: 14, textAlign: "left", fontWeight: "bold", color: "#1e3a8a" }}>Email</th>
              <th style={{ padding: 14, textAlign: "left", fontWeight: "bold", color: "#1e3a8a" }}>Gender</th>
              <th style={{ padding: 14, textAlign: "left", fontWeight: "bold", color: "#1e3a8a" }}>Role</th>
              <th style={{ padding: 14, textAlign: "center", fontWeight: "bold", color: "#1e3a8a" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u, idx) => (
              <tr key={u._id} style={{ borderBottom: "1px solid #e5e7eb", transition: "background-color 0.2s", cursor: "default" }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fff"}>
                <td style={{ padding: 12, fontSize:18 }}>{indexOfFirstUser + idx + 1}</td>
                <td style={{ padding: 12,  fontSize:18  }}>{u.name}</td>
                <td style={{ padding: 12,  fontSize:18  }}>{u.email}</td>
                <td style={{ padding: 12 ,  fontSize:18 }}>{u.gender}</td>
                <td style={{ padding: 12, color: u.role === "admin" ? "green" : u.role === "reader" ? "#ef4444" : "#111" ,  fontSize:20 }}>{u.role}</td>
                <td style={{ padding: 12, textAlign: "center",  fontSize:18  }}>
                  <button style={actionBtnStyle("#2563eb", 30)} onClick={() => setEditUser(u)}>Edit</button>
                  <button style={actionBtnStyle("#dc2626", 30)} onClick={() => handleDelete(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="6" style={{ padding: 12, textAlign: "center", color: "#6b7280" }}>No users found</td></tr>}
          </tbody>
        </table>
      </div>

      {users.length > usersPerPage && (
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, flexWrap:"wrap" }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={paginationBtnStyle(currentPage === 1)}
          >
            Previous
          </button>
          <span style={{ fontWeight: "bold", color: "#374151"  }}>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={paginationBtnStyle(currentPage === totalPages)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
