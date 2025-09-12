const mongoose = require("mongoose");

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
    }, // Optional: for email activation
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
