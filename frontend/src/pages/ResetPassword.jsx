import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import "./Login.css"; // Reuse same styling

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Email & OTP passed from VerifyOTP
  const email = location.state?.email;
  const otp = location.state?.otp;

  if (!email || !otp) {
    toast.error("Invalid request. Please start from Forgot Password.");
    navigate("/forgot-password");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      return toast.error("Please fill in all fields.");
    }

    if (password !== confirm) {
      return toast.error("Passwords do not match.");
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/api/auth/reset-password", {
        email,
        otp,
        newPassword: password,
      });

      toast.success(res.data.message || "Password reset successful!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src="/loginside.jpeg" alt="Reset Password" />
        <div className="overlay">
          <div className="overlay-center">
            <h1 className="brand-name">IdeaFlux</h1>
            <h3 className="brand-tagline">Set a new password</h3>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Reset Password</h2>
          <p className="login-subtitle">
            Enter and confirm your new password below
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
