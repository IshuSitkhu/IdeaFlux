const User = require("./user.model");
const bcrypt = require("bcrypt");

exports.registerUser = async ({ name, email, password, gender, bio, role }) => {
  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) throw { status: 409, message: "Email already registered" };

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Decide role safely: allow only "reader" from frontend by default
  // Admin creation should be restricted via a separate admin route
const userRole = "reader";

  const user = new User({
    name,
    email,
    password: hashedPassword,
    gender,
    bio,
    role: userRole, // use safe role
  });

  return await user.save();
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw { status: 404, message: "User not found" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, message: "Invalid credentials" };

  return user;
};

exports.activateUser = async (userId) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isActive: true },
    { new: true }
  );

  if (!updatedUser) throw { status: 404, message: "User not found" };

  return updatedUser;
};

/**
 * Admin-only function: creates a user with any role ("reader" or "admin")
 * Use this only from admin route with proper authorization
 */
exports.adminCreateUser = async ({ name, email, password, gender, bio, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw { status: 409, message: "Email already registered" };

  const hashedPassword = await bcrypt.hash(password, 10);

  // Validate role: either "reader" or "admin"
  const userRole = role === "admin" ? "admin" : "reader";

  const user = new User({
    name,
    email,
    password: hashedPassword,
    gender,
    bio,
    role: userRole,
    isActive: true, // Admin-created accounts can be active immediately
  });

  return await user.save();
};