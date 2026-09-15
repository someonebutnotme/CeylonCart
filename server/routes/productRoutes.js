import express from "express";
import Product from "../models/Product.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET all products with dynamic search and multi-attribute filters
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      size,
      color,
      minPrice,
      maxPrice,
      minRating,
      sort,
    } = req.query;

    const filter = {};

    // Category filter
    if (category && category !== "All" && category !== "All Categories") {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
    }

    // Keyword search filter
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { badge: { $regex: q, $options: "i" } },
        { colors: { $regex: q, $options: "i" } },
      ];
    }

    // Size filter
    if (size) {
      const sizeList = Array.isArray(size)
        ? size
        : String(size)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      if (sizeList.length > 0) {
        filter.sizes = { $in: sizeList };
      }
    }

    // Color filter
    if (color) {
      const colorList = Array.isArray(color)
        ? color
        : String(color)
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);
      if (colorList.length > 0) {
        filter.colors = {
          $in: colorList.map((c) => new RegExp(`^${c}$`, "i")),
        };
      }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Rating filter
    if (minRating && !isNaN(Number(minRating))) {
      filter.rating = { $gte: Number(minRating) };
    }

    // Build query
    let query = Product.find(filter);

    // Sorting
    switch (sort) {
      case "price_asc":
        query = query.sort({ price: 1 });
        break;
      case "price_desc":
        query = query.sort({ price: -1 });
        break;
      case "rating_desc":
        query = query.sort({ rating: -1, reviews: -1 });
        break;
      case "newest":
      default:
        query = query.sort({ createdAt: -1 });
        break;
    }

    const products = await query.exec();
    res.json(products);
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST create a new product (Admin only)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      rating = 5,
      reviews = 0,
      img,
      badge,
      badgeColor,
      description,
      category = "General",
      stock = 50,
      sizes = [],
      colors = [],
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: "Product name and price are required." });
    }

    // Parse sizes and colors if comma-separated strings
    const parsedSizes = Array.isArray(sizes)
      ? sizes
      : typeof sizes === "string"
      ? sizes.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedColors = Array.isArray(colors)
      ? colors
      : typeof colors === "string"
      ? colors.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    const newProduct = new Product({
      name: name.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      rating: Number(rating) || 5,
      reviews: Number(reviews) || 0,
      img: img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&auto=format",
      badge: badge ? badge.trim() : undefined,
      badgeColor: badgeColor ? badgeColor.trim() : undefined,
      description: description ? description.trim() : undefined,
      category: category.trim(),
      stock: Number(stock) || 50,
      sizes: parsedSizes,
      colors: parsedColors,
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create new product." });
  }
});

// PUT update product (Admin only)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product." });
  }
});

// DELETE remove product (Admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json({ message: "Product deleted successfully.", id: req.params.id });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

export default router;
