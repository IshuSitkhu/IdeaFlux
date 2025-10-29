const User = require("../user/user.model");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// OTP expiry (5 minutes)
const OTP_TTL_MS = 5 * 60 * 1000;

// 🔹 Create a single transporter instance (no redeclare)
const transporter = nodemailer.createTransport({
  service: process.env.SMTP_PROVIDER || "gmail",
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // allow self-signed certificates
  },
});

// --- 1. Send OTP ---
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // save to DB
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + OTP_TTL_MS;
    await user.save();

    // send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "IdeaFlux — Password Reset OTP",
      html: `
        <p>Hello ${user.name || "user"},</p>
        <p>Your password reset OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 5 minutes. If you didn’t request this, ignore this email.</p>
      `,
    });

    return res.status(200).json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("forgotPassword:", err);
    next(err);
  }
};

// --- 2. Verify OTP ---
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.resetOTP || !user.resetOTPExpiry)
      return res.status(400).json({ message: "No OTP request found" });

    if (Date.now() > user.resetOTPExpiry)
      return res.status(400).json({ message: "OTP expired" });

    if (user.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    return res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.error("verifyOTP:", err);
    next(err);
  }
};

// --- 3. Reset Password ---
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user.resetOTPExpiry)
      return res.status(400).json({ message: "OTP expired" });

    // hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // clear otp fields
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword:", err);
    next(err);
  }
};
