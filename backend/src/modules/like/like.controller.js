// like.controller.js

import Like from './like.model.js';

// Get all likes
export const getAllLikes = async (req, res) => {
  try {
    const likes = await Like.find();
    res.status(200).json(likes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch likes" });
  }
};

// Toggle Like
export const toggleLike = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    const existing = await Like.findOne({ blogId, userId });

    if (existing) {
      await existing.deleteOne();
    } else {
      await Like.create({ blogId, userId });
    }

    const totalLikes = await Like.countDocuments({ blogId });
    const liked = !existing;

    return res.status(200).json({
      success: true,
      message: liked ? "Liked" : "Unliked",
      liked,
      totalLikes,
    });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLikeStatus = async (req, res) => {
  const userId = req.user.id; // or req.user._id if using mongoose
  const blogId = req.params.blogId;

  try {
    const like = await Like.findOne({ blogId: blogId, userId: userId });
    const totalLikes = await Like.countDocuments({ blogId: blogId });

    res.status(200).json({
      liked: !!like,
      totalLikes,
    });
  } catch (error) {
    console.error("Error getting like status:", error);
    res.status(500).json({ message: "Error checking like status" });
  }
};

