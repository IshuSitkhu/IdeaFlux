const userService = require("../user/user.service");
const jwtService = require("../../services/jwt.service");
const mailer = require("../../utils/mailer");

// REGISTER with welcome email
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, gender, bio } = req.body;

    const userRole = "reader";

    const user = await userService.registerUser({
      name,
      email,
      password,
      gender,
      bio,
      role: userRole, // ignore whatever comes from frontend
    });

    // Mark user as active immediately
    user.isActive = true;
    await user.save();

    // Send welcome email
    await mailer.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "🎉 Welcome to IdeaFlux!",
      html: `
        <h3>Hi ${user.name},</h3>
        <p>Thanks for registering with <strong>IdeaFlux</strong>.</p>
        <p>Your account has been created successfully! 🚀</p>
        <p>You can now log in and start exploring ideas.</p>
        <br/>
        <p>— Team IdeaFlux</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Please login.",
    });
  } catch (err) {
    next(err);
  }
};

// LOGIN unchanged
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userService.loginUser({ email, password });

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Please activate your account first via email.",
      });
    }

    const token = jwtService.signToken({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
