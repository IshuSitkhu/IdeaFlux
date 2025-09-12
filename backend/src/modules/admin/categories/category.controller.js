const Category = require("./category.model");

// Fetch all categories
const fetchCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    console.log("Fetched categories:", categories); // 🔍 log the result
    res.json({ success: true, categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};


// Add new category
const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: "Category already exists" });

    const newCategory = new Category({ name });
    await newCategory.save();

    res.status(201).json({ success: true, category: newCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add category" });
  }
};

// Edit category
const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updated = await Category.findByIdAndUpdate(id, { name }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, category: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
};

// Delete category
const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });

    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
};

module.exports = {
  fetchCategories,
  addCategory,
  editCategory,
  removeCategory,
};
