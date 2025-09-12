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
  const usersPerPage = 4;
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

  const handlePromote = async (user) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Promote failed");
      setUsers((prev) => prev.map((u) => (u._id === user._id ? body.user : u)));
      alert("User promoted to admin");
    } catch (err) {
      alert("Error promoting user: " + err.message);
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  if (loading) return <p style={{ padding: 20 }}>Loading users...</p>;

  // Styling helpers
  const actionBtnStyle = (bgColor, width = 36) => ({
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
    minWidth: width,
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
            marginBottom: 20,
            padding: "10px 18px",
            backgroundColor: "#3b82f6",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
        >
          ➕ Add New User
        </button>
      )}

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
                {/* {u.role !== "admin" && <button style={actionBtnStyle("#10b981", 30)} onClick={() => handlePromote(u)}>➕Promote</button>} */}
                <button style={actionBtnStyle("#2563eb", 30)} onClick={() => setEditUser(u)}>Edit</button>
                <button style={actionBtnStyle("#dc2626", 30)} onClick={() => handleDelete(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan="6" style={{ padding: 12, textAlign: "center", color: "#6b7280" }}>No users found</td></tr>}
        </tbody>
      </table>

      {users.length > usersPerPage && (
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
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
