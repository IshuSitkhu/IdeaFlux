import React, { useState, useEffect } from "react";

const AdminUserForm = ({ user, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "reader",
    gender: "female",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "reader",
        gender: user.gender || "female",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.name) return setErrors({ form: "Name is required" });
    if (!form.email) return setErrors({ form: "Email is required" });

    if (!user && !form.password) {
      return setErrors({ form: "Password is required for new users" });
    }

    if (form.password) {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,25}$/;
      if (!passwordPattern.test(form.password)) {
        return setErrors({
          form: "Password must include uppercase, lowercase, number, and special character",
        });
      }
    }

    const payload = { ...form };
    if (user && !form.password) delete payload.password;

    onSubmit(payload);
  };

  // Styles
  const inputStyle = {
    marginBottom: 12,
    padding: 10,
    width: "100%",
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    outline: "none",
    transition: "all 0.2s",
  };

  const selectStyle = { ...inputStyle, appearance: "none", backgroundColor: "#fff" };

  const submitBtnStyle = {
    padding: "8px 16px",
    backgroundColor: "#2274a1",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    marginRight: 8,
  };

  const cancelBtnStyle = {
    padding: "8px 16px",
    backgroundColor: "#e5e7eb",
    color: "#374151",
    fontWeight: "bold",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: 20,
        padding: 20,
        background: "#f9fafb",
        borderRadius: 10,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        maxWidth: 400,
      }}
    >
      <h2 style={{ fontSize: 20, marginBottom: 16, color: "#1e3a8a" }}>
        {user ? "Update User" : "Add New User"}
      </h2>

      {errors.form && <p style={{ color: "red", marginBottom: 12 }}>{errors.form}</p>}

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        style={inputStyle}
        onFocus={(e) => e.target.style.borderColor = "#2274a1"}
        onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        style={inputStyle}
        onFocus={(e) => e.target.style.borderColor = "#2274a1"}
        onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
      />

      <input
        type="password"
        name="password"
        placeholder={user ? "New Password (leave blank to keep current)" : "Password"}
        value={form.password}
        onChange={handleChange}
        style={inputStyle}
        onFocus={(e) => e.target.style.borderColor = "#2274a1"}
        onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
        required={!user}
      />

      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        style={selectStyle}
        onFocus={(e) => e.target.style.borderColor = "#2274a1"}
        onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
      >
        <option value="reader">Reader</option>
        <option value="admin">Admin</option>
      </select>

      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        style={selectStyle}
        onFocus={(e) => e.target.style.borderColor = "#2274a1"}
        onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
      >
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>

      <button
        type="submit"
        style={submitBtnStyle}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2274a1"}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2274a1db"}
      >
        {user ? "Update" : "Add"}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          style={cancelBtnStyle}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#d1d5db"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#e5e7eb"}
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default AdminUserForm;
