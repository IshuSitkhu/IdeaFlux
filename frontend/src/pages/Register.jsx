import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "female",
  });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [popupError, setPopupError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerMsg("");

    try {
      const res = await axios.post("http://localhost:8000/api/auth/register", form, {
        withCredentials: true,
      });

      setServerMsg(res.data.message);
      toast.success("🎉 Registered successfully! Please log in.");

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "female",
      });

      navigate("/login");
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => (fieldErrors[e.field] = e.message));
        setErrors(fieldErrors);
      } else {
        const message = err.response?.data?.message || "Something went wrong.";
        if (message === "Email already registered") {
          setPopupError(message);
          setTimeout(() => setPopupError(""), 7000);
          toast.error("❌ Email already registered. Try logging in.");
        } else {
          setServerMsg(message);
          toast.error("❌ " + message);
        }
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Create Account</h2>

        {serverMsg && <p className="server-msg">{serverMsg}</p>}
        {popupError && <div className="popup-error">{popupError}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="login-input"
          />
          <p className={`error-text ${errors.name ? "show" : ""}`}>{errors.name || " "}</p>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="login-input"
          />
          <p className={`error-text ${errors.email ? "show" : ""}`}>{errors.email || " "}</p>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="login-input"
          />
          <p className={`error-text ${errors.password ? "show" : ""}`}>{errors.password || " "}</p>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="login-input"
          />
          <p className={`error-text ${errors.confirmPassword ? "show" : ""}`}>
            {errors.confirmPassword || " "}
          </p>

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="login-input"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <button type="submit" className="login-btn">
            Register
          </button>
        </form>

        <p className="register-text">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")} className="register-btn">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
