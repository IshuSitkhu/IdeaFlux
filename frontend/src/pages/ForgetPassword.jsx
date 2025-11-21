import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Reuse same style for consistency

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email.");

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, { email });
      toast.success(res.data.message || "OTP sent to your email!");
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src="/loginside.jpeg" alt="Forgot Password" />
        <div className="overlay">
          <div className="overlay-center">
            <h1 className="brand-name">IdeaFlux</h1>
            <h3 className="brand-tagline">Recover your access</h3>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Forgot Password</h2>
          <p className="login-subtitle">Enter your email to get an OTP</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          <p className="register-text">
            Remembered your password?{" "}
            <button onClick={() => navigate("/login")} className="register-btn">
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
