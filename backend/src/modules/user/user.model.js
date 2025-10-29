const mongoose = require("mongoose");
const Blog = require("../blog/blog.model"); 

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["reader", "admin"],
      default: "reader",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    bio: {
      type: String,
      maxLength: 300,
    },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    createdAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔹 For password reset
    resetOTP: { type: String, default: null },
    resetOTPExpiry: { type: Date, default: null },
  },
  {
    versionKey: false,
  }
);

/**
 * 🔥 Middleware:
 * Automatically delete all blogs created by a user
 * before the user document itself is deleted.
 */
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const user = await this.model.findOne(this.getFilter());
    if (user) {
      await Blog.deleteMany({ author: user._id });
      console.log(`🗑️ All blogs by user ${user.name} (${user._id}) deleted`);
    }
    next();
  } catch (err) {
    console.error("Error deleting user blogs:", err);
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
