const Joi = require("joi");

// Password regex: same as auth
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,25}$/;

// Admin creating a user
const AdminUserCreateDTO = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordPattern).required().messages({
    "string.pattern.base":
      "Password must include uppercase, lowercase, number, and special character",
  }),
  role: Joi.string().valid("reader", "admin").default("reader"),
  gender: Joi.string().valid("male", "female", "other").default("other"),
  bio: Joi.string().max(300).optional(),
});

// Admin updating a user (all optional → partial update works)
const AdminUserUpdateDTO = Joi.object({
  name: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().pattern(passwordPattern).optional().messages({
    "string.pattern.base":
      "Password must include uppercase, lowercase, number, and special character",
  }),
  role: Joi.string().valid("reader", "admin").optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  bio: Joi.string().max(300).optional(),
});

const AdminBlogCreateDTO = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(10).required(),
  author: Joi.string().required(),
  image: Joi.string().optional().allow(""),
  categories: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
});

const AdminBlogUpdateDTO = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  content: Joi.string().min(10).optional(),
  author: Joi.string().optional(),
  image: Joi.string().optional().allow(""),
  categories: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
});


module.exports = {
  AdminUserCreateDTO,
  AdminUserUpdateDTO,
  AdminBlogCreateDTO,
  AdminBlogUpdateDTO,
};

