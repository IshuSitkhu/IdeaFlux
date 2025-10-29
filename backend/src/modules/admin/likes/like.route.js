const express = require("express");
const router = express.Router();
const adminLikeController = require("./like.controller");
const verifyToken = require("../../middleware/auth.middleware");

// Optional: Admin verification middleware
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  next();
};

// Routes
router.get("/", verifyToken, verifyAdmin, adminLikeController.getAllLikesAdmin);
router.delete("/:id", verifyToken, verifyAdmin, adminLikeController.deleteLikeAdmin);

module.exports = router;
