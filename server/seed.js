import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Product from "./models/Product.js";
import User from "./models/User.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ceyloncart";

const initialProducts = [
  {
    name: "Nike Air Max 270 Running Shoes",
    price: 14999,
    originalPrice: 21500,
    rating: 4.8,
    reviews: 2341,
    img: "https://images.unsplash.com/photo-1709258228137-19a8c193be39?w=400&h=400&fit=crop&auto=format",
    category: "Sports",
    description: "Breathable, lightweight running shoes with maximum cushioning for everyday comfort.",
    stock: 25,
    sizes: ["US 8", "US 9", "US 10", "US 11"],
    colors: ["Black", "White", "Red"],
  },
  {
    name: "The Ordinary Skincare Bundle Set",
    price: 3850,
    originalPrice: 5200,
    rating: 4.7,
    reviews: 892,
    img: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=400&h=400&fit=crop&auto=format",
    category: "Beauty",
    description: "Complete daily hydration and radiance regimen featuring Niacinamide and Hyaluronic Acid.",
    stock: 40,
    sizes: ["Standard 30ml", "Value 60ml"],
    colors: ["Clear"],
  },
  {
    name: 'Apple MacBook Pro 14" M3',
    price: 389000,
    originalPrice: 445000,
    rating: 4.9,
    reviews: 418,
    img: "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?w=400&h=400&fit=crop&auto=format",
    category: "Electronics",
    description: "Supercharged by M3 chip, stunning Liquid Retina XDR display, and all-day battery life.",
    stock: 12,
    sizes: ["14-inch", "16-inch"],
    colors: ["Space Black", "Silver"],
  },
  {
    name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    price: 42500,
    originalPrice: 58000,
    rating: 4.8,
    reviews: 1107,
    img: "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=400&h=400&fit=crop&auto=format",
    category: "Electronics",
    description: "Industry-leading noise cancellation, crystal clear hands-free calling, and up to 30 hours of battery life.",
    stock: 30,
    sizes: ["One Size"],
    colors: ["Black", "Silver", "Midnight Blue"],
  },
  {
    name: "Stainless Steel 5-Piece Cookware Set",
    price: 8750,
    originalPrice: 13200,
    rating: 4.5,
    reviews: 634,
    img: "https://images.unsplash.com/photo-1580929753603-10519c6e480a?w=400&h=400&fit=crop&auto=format",
    category: "Home & Living",
    description: "Premium culinary tri-ply stainless steel pots and pans with induction-ready bases.",
    stock: 18,
    sizes: ["5-Piece", "10-Piece"],
    colors: ["Silver"],
  },
  {
    name: "Samsung Galaxy S25 Ultra 256GB",
    price: 219999,
    originalPrice: 271000,
    rating: 4.8,
    reviews: 1247,
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format",
    badge: "Official Store",
    category: "Electronics",
    description: "Next-generation smartphone with AI photography, titanium frame, and Snapdragon processor.",
    stock: 15,
    sizes: ["256GB", "512GB", "1TB"],
    colors: ["Titanium Black", "Titanium Gray", "Silver"],
  },
  {
    name: "Women's Floral Summer Dress",
    price: 2990,
    rating: 4.6,
    reviews: 388,
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop&auto=format",
    badge: "Trending",
    badgeColor: "#d97706",
    category: "Fashion",
    description: "Lightweight, airy floral print dress suitable for casual occasions and sunny outings.",
    stock: 45,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pink", "Blue", "Yellow"],
  },
  {
    name: "Makeup Brush Set — 24 Pcs Professional",
    price: 1850,
    originalPrice: 2800,
    rating: 4.5,
    reviews: 712,
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format",
    category: "Beauty",
    description: "Ultra-soft synthetic bristles designed for blending, contouring, and precise cosmetic application.",
    stock: 60,
    sizes: ["24 Pcs", "32 Pcs"],
    colors: ["Rose Gold", "Pink", "Black"],
  },
  {
    name: "Cozy Minimalist Living Room Rug 160×230",
    price: 12500,
    originalPrice: 17000,
    rating: 4.7,
    reviews: 203,
    img: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop&auto=format",
    category: "Home & Living",
    description: "Plush, non-shedding floor rug adding warmth and modern elegance to any interior room.",
    stock: 10,
    sizes: ["160x230 cm", "200x300 cm"],
    colors: ["Beige", "Gray", "Cream"],
  },
  {
    name: "Nike Dri-FIT Running T-Shirt",
    price: 3200,
    originalPrice: 4500,
    rating: 4.6,
    reviews: 956,
    img: "https://images.unsplash.com/photo-1637437757614-6491c8e915b5?w=400&h=400&fit=crop&auto=format",
    category: "Sports",
    description: "Moisture-wicking athletic tee engineered to keep you dry and comfortable during intensive workouts.",
    stock: 50,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Blue", "Gray", "Green"],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing products and reseed
    await Product.deleteMany({});
    const created = await Product.insertMany(initialProducts);
    console.log(`Successfully seeded ${created.length} products with sizes and colors!`);

    // Seed default admin, manager, and customer accounts
    await User.deleteMany({});
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const managerPasswordHash = await bcrypt.hash("manager123", 10);
    const customerPasswordHash = await bcrypt.hash("customer123", 10);

    const seededUsers = await User.insertMany([
      {
        name: "Admin CeylonCart",
        email: "admin@ceyloncart.com",
        password: adminPasswordHash,
        role: "admin",
      },
      {
        name: "Nimalka Manager",
        email: "manager@ceyloncart.com",
        password: managerPasswordHash,
        role: "admin",
      },
      {
        name: "John Perera",
        email: "john@example.com",
        password: customerPasswordHash,
        role: "customer",
      },
      {
        name: "Sarah Fernando",
        email: "sarah@example.com",
        password: customerPasswordHash,
        role: "customer",
      },
      {
        name: "Kamal Silva",
        email: "kamal@example.com",
        password: customerPasswordHash,
        role: "customer",
      },
    ]);
    console.log(`Successfully seeded ${seededUsers.length} user accounts (Admin, Manager & Customers)!`);

    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
