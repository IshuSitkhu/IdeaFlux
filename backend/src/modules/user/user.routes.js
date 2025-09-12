const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("./user.model");
const { getUserProfileAndBlogs , searchUsers , adminCreateUser } = require("./user.controller");
const Notification = require("../notification/notification.model"); // ✅ ADD THIS
const verifyToken = require("../../middleware/auth.middleware"); // or adjust path as needed
const authorize = require("../../middleware/authorize.middleware");


// ✅ Activate Account
router.get("/activate/:token", async (req, res, next) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.isActive) {
      return res.status(200).json({ success: true, message: "Account already activated" });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({ success: true, message: "Account activated successfully" });
  } catch (err) {
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
});

router.get("/search",verifyToken, searchUsers);


// ✅ Get Author Profile & Blogs
router.get("/:userId", getUserProfileAndBlogs);

// ✅ View Public Profile
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate("followers", "name email")
      .populate("following", "name email");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
});


// ✅ Follow/Unfollow Route
router.post("/follow/:userId", async (req, res) => {
  const { currentUserId } = req.body;
  const targetUserId = req.params.userId;

  if (currentUserId === targetUserId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = currentUser.following.includes(targetUserId);

    if (alreadyFollowing) {
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
      await currentUser.save();
      await targetUser.save();
      return res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();

      // Create a new unread notification
      await Notification.create({
        type: "follow",
        sender: currentUserId,
        receiver: targetUserId,
        message: `${currentUser.name} followed you`,
        read: false, // default but explicit
      });

      return res.status(200).json({ message: "Followed successfully" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
});


router.post("/admin/create", verifyToken, authorize("admin"), adminCreateUser);


module.exports = router;
