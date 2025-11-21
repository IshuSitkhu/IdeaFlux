import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { KeyRound } from "lucide-react";
import "./Login.css"; // Reuse same design

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // email passed from ForgotPassword page
  const email = location.state?.email;

  if (!email) {
    // if user came here manually
    toast.error("Email not found. Please start from Forgot Password.");
    navigate("/forgot-password");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter OTP.");

    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, {
        email,
        otp,
      });

      toast.success(res.data.message || "OTP verified successfully!");
      // Go to reset password page
      navigate("/reset-password", { state: { email, otp } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src="/loginside.jpeg" alt="Verify OTP" />
        <div className="overlay">
          <div className="overlay-center">
            <h1 className="brand-name">IdeaFlux</h1>
            <h3 className="brand-tagline">Secure your account</h3>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Verify OTP</h2>
          <p className="login-subtitle">
            Enter the 6-digit OTP sent to your email
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-wrapper">
              <KeyRound className="input-icon" />
              <input
                type="text"
                name="otp"
                placeholder="Enter your OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <p className="register-text">
            Didn’t get the OTP?{" "}
            <button
              onClick={() => navigate("/forgot-password")}
              className="register-btn"
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
