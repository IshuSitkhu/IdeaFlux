import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Mail, Lock } from "lucide-react";
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
      toast.success("Registered successfully! Please log in.");

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
          toast.error("Email already registered. Try logging in.");
        } else {
          setServerMsg(message);
          toast.error("❌ " + message);
        }
      }
    }
  };

  return (
    <div className="register-wrapper">
      {/* Left side image + overlay */}
      <div className="register-left">
        <img src="/loginside.jpeg" alt="Register side" />
        <div className="register-overlay">
          <div className="register-overlay-center">
            <h1 className="register-brand-name">IdeaFlux</h1>
            <h3 className="register-brand-tagline">A Blog Platform</h3>
          </div>
          <p className="register-overlay-bottom">
            “Express your ideas freely and connect with others.”
          </p>
        </div>
      </div>

      {/* Right side form */}
      <div className="register-right">
        <div className="register-card">
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">Join us and explore amazing features</p>

          {serverMsg && <p className="server-msg">{serverMsg}</p>}
          {popupError && <div className="popup-error">{popupError}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <p className={`error-text ${errors.name ? "show" : ""}`}>{errors.name || " "}</p>

            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <p className={`error-text ${errors.email ? "show" : ""}`}>{errors.email || " "}</p>

            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <p className={`error-text ${errors.password ? "show" : ""}`}>{errors.password || " "}</p>

            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <p className={`error-text ${errors.confirmPassword ? "show" : ""}`}>
              {errors.confirmPassword || " "}
            </p>

            <div className="input-wrapper">
              <User className="input-icon" />
              <select name="gender" value={form.gender} onChange={handleChange} required>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button type="submit" className="register-btn-main">
              Register
            </button>
          </form>

          <p className="register-text">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="register-btn"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
