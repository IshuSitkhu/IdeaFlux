const User = require("./user.model");
const Blog = require("../../modules/blog/blog.model");
const userService = require("./user.service")

exports.getUserProfileAndBlogs = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
    .select("-password")
    .populate("followers", "name email")   // populate followers
    .populate("following", "name email");

    if (!user) return res.status(404).json({ message: "User not found" });

    const blogs = await Blog.find({ author: userId }).sort({ createdAt: -1 });

    // Add follower/following count fields
    const followerCount = user.followers.length;
    const followingCount = user.following.length;

    return res.status(200).json({ 
      user: {
        ...user.toObject(),
        followerCount,
        followingCount,
      }, 
      blogs 
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// user.controller.js
exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.query;

    console.log("🔍 Search query:", query); // 👉 Debugging line

    if (!query) return res.status(400).json({ message: "Query is required" });

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("_id name email");

    console.log("✅ Found users:", users); // 👉 Debugging line

    res.status(200).json({ users });
  } catch (error) {
    console.error("❌ Search error:", error); // 👈 Full error
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// ✅ Admin-only: create new user with role
exports.adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, gender, bio, role } = req.body;

    // Only allow admin access via middleware
    const user = await userService.adminCreateUser({ name, email, password, gender, bio, role });

    res.status(201).json({ success: true, message: "User created successfully", user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
  }
};