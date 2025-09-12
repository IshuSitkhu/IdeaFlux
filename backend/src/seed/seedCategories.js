require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../modules/admin/categories/category.model");
const connectToMongoDB = require("../config/mongodb.config"); // adjust path if needed

const seedCategories = async () => {
  try {
    await connectToMongoDB();

    // All categories you mentioned
    const categories = [
      { name: "Technology" },
      { name: "Programming" },
      { name: "Lifestyle" },
      { name: "Entertainment" },
      { name: "Music" },
      { name: "Movies" },
      { name: "Sports" },
      { name: "Travel" },
      { name: "Food" },
      { name: "Nature" },
      { name: "Health" },
      { name: "Education" },
      { name: "Bollywood" },
      { name: "Fashion" },
      { name: "Personal" },
      { name: "News" },
    ];

    // Optional: Clear existing categories to avoid duplicates
    await Category.deleteMany({});
    console.log("✅ Existing categories cleared");

    // Insert new categories
    await Category.insertMany(categories);
    console.log("✅ Categories seeded successfully");

    process.exit(0); // Exit script
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
