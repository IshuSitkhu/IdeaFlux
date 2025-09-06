const { io } = require("../../config/express.config");
const Notification = require("./notification.model");

exports.sendFollowNotification = async (senderId, receiverId) => {
  const notification = await Notification.create({
    sender: senderId,
    receiver: receiverId,
    type: "follow",
    message: "followed you",
  });

  // Emit to the receiver in real-time
  io.to(receiverId.toString()).emit("newNotification", notification);
};

exports.sendLikeNotification = async (senderId, receiverId, blogId) => {
  const notification = await Notification.create({
    sender: senderId,
    receiver: receiverId,
    type: "like",
    message: "liked your post",
    blogId, // Include the blogId
  });

  // Emit to the receiver in real-time
  io.to(receiverId.toString()).emit("newNotification", notification);
};

exports.sendCommentNotification = async (senderId, receiverId, blogId) => {
  const notification = await Notification.create({
    sender: senderId,
    receiver: receiverId,
    type: "comment",
    message: "commented on your post",
    blogId, // Include the blogId
  });

  // Emit to the receiver in real-time
  io.to(receiverId.toString()).emit("newNotification", notification);
};

exports.getNotifications = async (req, res) => {
  const userId = req.params.userId;

  try {
    const notifications = await Notification.find({ receiver: userId })
      .populate("sender", "name")
      .sort({ createdAt: -1 });

    res.json({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length, // updated
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

exports.markAllRead = async (req, res) => {
  const userId = req.params.userId;

  try {
    await Notification.updateMany(
      { receiver: userId, isRead: false }, // updated
      { $set: { isRead: true } } // updated
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Failed to mark as read", error });
  }
};


const fetchNotifications = async () => {
  try {
    const res = await axios.get(
      `http://localhost:8000/api/notification/${currentUser.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications(res.data.notifications || []);
  } catch (err) {
    console.error("Error fetching notifications", err);
  }
};


