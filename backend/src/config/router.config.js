const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/user/user.routes"); 
const adminRoutes = require("../modules/admin/admin.route")
const blogRoutes = require("../modules/blog/blog.route");
const uploadRoutes = require("../modules/upload/upload.route"); // Assuming you have an upload route defined
const notificationRoutes = require("../modules/notification/notification.route");
const likeRoutes = require("../modules/like/like.route"); // plural 'likes' to match the URL your Python calls
const categoryRoutes = require("../modules/admin/categories/category.routes");
const resetRoutes = require("../modules/auth/auth.reset.routes");



const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/auth", resetRoutes);

router.use("/api/user", userRoutes); 
router.use("/api/admin",adminRoutes);
router.use("/api/admin/categories", categoryRoutes);
router.use("/api/blog", blogRoutes);
router.use("/api/upload", uploadRoutes); // Assuming you have an uploadRoutes defined
router.use("/api/notification", notificationRoutes);
router.use("/api/likes", likeRoutes); // plural 'likes' to match the URL your Python calls



module.exports = router;
