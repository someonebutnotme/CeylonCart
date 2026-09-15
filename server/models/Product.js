import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    rating: { type: Number, default: 5 },
    reviews: { type: Number, default: 0 },
    img: { type: String, required: true },
    badge: { type: String },
    badgeColor: { type: String },
    description: { type: String },
    category: { type: String, default: "General" },
    stock: { type: Number, default: 50 },
    sizes: [{ type: String }],
    colors: [{ type: String }],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
