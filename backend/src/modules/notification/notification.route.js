const express = require("express");
const router = express.Router();
const Notification = require("./notification.model"); // ✅ import model
const { getNotifications } = require("./notification.controller");

// Get notifications for a user
router.get("/:userId", getNotifications);

// Mark all notifications as read for a user
router.post("/mark-read/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    await Notification.updateMany(
      { receiver: userId, isRead: false }, // updated
      { $set: { isRead: true } } // updated
    );
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    res.status(500).json({ message: "Error marking notifications as read", error: err });
  }
});


module.exports = router;
