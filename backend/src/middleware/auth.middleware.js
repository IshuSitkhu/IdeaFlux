
// module.exports = verifyToken;
const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model"); // adjust path if needed

const verifyToken = async (req, res, next) => {
  console.log("🛡️ verifyToken middleware triggered");
  console.log("✅ Token verified, moving to next()");



  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 Fetch user from DB to get full info
    const user = await User.findById(decoded.id).select("username name email role");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Attach user info to req.user
      req.user = {
      id: user._id.toString(),
      name: user.name || user.username,
      role: user.role, // include role
    };


    console.log("✅ Token Verified User ID:", req.user.id);

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = verifyToken;
