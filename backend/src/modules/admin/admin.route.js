const express = require("express");
const verifyToken = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/authorize.middleware");
const bodyValidator = require("../../middleware/validator.middleware");
const bcrypt = require("bcryptjs");

const User = require("../user/user.model");
const Blog = require("../blog/blog.model");
const {
  AdminUserCreateDTO,
  AdminUserUpdateDTO,
  AdminBlogCreateDTO,
  AdminBlogUpdateDTO,
} = require("./admin.validator");


const router = express.Router();

/**
 * Admin Routes
 * All routes require:
 *  - valid token (verifyToken)
 *  - role === "admin" (authorize)
 */

/** -------------------- USER ROUTES -------------------- **/

// Get all users
router.get("/users", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single user by ID
router.get("/users/:id", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a new user (with validation & hashed password)
router.post(
  "/users",
  verifyToken,
  authorize("admin"),
  bodyValidator(AdminUserCreateDTO),
  async (req, res) => {
    try {
      const { name, email, password, role, gender, bio } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        gender,
        bio,
      });

      res.status(201).json({
        success: true,
        user: { ...user.toObject(), password: undefined },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// Update user by ID (with validation — partial updates allowed)
router.patch(
  "/users/:id",
  verifyToken,
  authorize("admin"),
  bodyValidator(AdminUserUpdateDTO),
  async (req, res) => {
    try {
      const updates = req.body;

      // Hash password if updated
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      }).select("-password");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// Delete user by ID
router.delete("/users/:id", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Promote user to admin
router.patch(
  "/users/:id/make-admin",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: "admin" },
        { new: true }
      ).select("-password");

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/** -------------------- BLOG ROUTES -------------------- **/

// Get all blogs
router.get("/blogs", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name email");
    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single blog by ID
router.get("/blogs/:id", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create new blog (with validation)
router.post(
  "/blogs",
  verifyToken,
  authorize("admin"),
  bodyValidator(AdminBlogCreateDTO),
  async (req, res) => {
    try {
      const { title, content, author, image, categories } = req.body;
      const blog = await Blog.create({ title, content, author, image, categories });
      res.status(201).json({ success: true, blog });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// Update blog by ID (with validation)
router.patch(
  "/blogs/:id",
  verifyToken,
  authorize("admin"),
  bodyValidator(AdminBlogUpdateDTO),
  async (req, res) => {
    try {
      const updates = req.body;
      const blog = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!blog)
        return res.status(404).json({ success: false, message: "Blog not found" });
      res.json({ success: true, blog });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);


// Delete blog by ID
router.delete("/blogs/:id", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
