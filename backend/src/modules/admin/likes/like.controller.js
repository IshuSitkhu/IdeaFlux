const Like = require("../../../like/like.model"); // path to Like model

// Admin: Get all likes
exports.getAllLikesAdmin = async (req, res) => {
  try {
    const likes = await Like.find()
      .populate({ path: "userId", select: "name email" }) // populate user info
      .populate({ path: "blogId", select: "title" })      // populate blog info
      .lean();

    // format for frontend
    const formattedLikes = likes.map(like => ({
      _id: like._id,
      user: like.userId || null, // if user deleted
      blog: like.blogId || null, // if blog deleted
    }));

    res.status(200).json({ likes: formattedLikes });
  } catch (err) {
    console.error("Error fetching likes:", err);
    res.status(500).json({ message: "Failed to fetch likes" });
  }
};

// Admin: Delete a like
exports.deleteLikeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Like.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Like not found" });
    }

    res.status(200).json({ message: "Like deleted successfully" });
  } catch (err) {
    console.error("Error deleting like:", err);
    res.status(500).json({ message: "Failed to delete like" });
  }
};
