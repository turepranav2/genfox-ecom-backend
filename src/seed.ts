import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User";
import Category from "./models/Category";
import Product from "./models/Product";

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI!);

  // Clear existing data
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});

  // Create user
  const user = await User.create({
    name: "Test User",
    email: "test@gmail.com",
    password: "123456"
  });

  // Create category
  const category = await Category.create({
    name: "Tech",
    subcategories: ["Mobiles", "Laptops"]
  });

  // Create product
  await Product.create({
    name: "iPhone 15",
    description: "Latest Apple phone",
    price: 80000,
    stock: 10,
    category: category._id,
    subcategory: "Mobiles"
  });

  console.log("Database seeded successfully");
  process.exit();
};

seed();