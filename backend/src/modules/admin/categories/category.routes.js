const express = require("express");
const router = express.Router();

// Controllers
const {
  fetchCategories,
  addCategory,
  editCategory,
  removeCategory,
} = require("./category.controller");

// Middleware
const verifyToken = require("../../../middleware/auth.middleware");
const authorize = require("../../../middleware/authorize.middleware");
const bodyValidator = require("../../../middleware/validator.middleware");

// Joi schema for category validation
const Joi = require("joi");
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
});

// Public route
router.get("/", fetchCategories);

// Admin protected routes
router.post("/", verifyToken, authorize("admin"), bodyValidator(categorySchema), addCategory);
router.put("/:id", verifyToken, authorize("admin"), bodyValidator(categorySchema), editCategory);
router.delete("/:id", verifyToken, authorize("admin"), removeCategory);

module.exports = router;
