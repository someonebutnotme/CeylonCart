import express from "express";
import Order from "../models/Order.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/orders (Create order - Logged in users only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shipping, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cannot place order with an empty cart." });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address || !shippingAddress.phone || !shippingAddress.city) {
      return res.status(400).json({ error: "Complete shipping details are required." });
    }

    const order = new Order({
      user: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      items: items.map((item) => ({
        productId: String(item.productId),
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity) || 1,
        img: item.img || "",
        size: item.selectedSize || item.size || undefined,
        color: item.selectedColor || item.color || undefined,
      })),
      shippingAddress: {
        name: shippingAddress.name.trim(),
        phone: shippingAddress.phone.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        postalCode: shippingAddress.postalCode ? shippingAddress.postalCode.trim() : "",
      },
      paymentMethod: paymentMethod || "Cash on Delivery",
      subtotal: Number(subtotal),
      shipping: Number(shipping) || 0,
      total: Number(total),
      status: "Pending",
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to place order." });
  }
});

// GET /api/orders/my-orders (Customer view their own orders)
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Fetch customer orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// GET /api/orders (Admin view all orders across store)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Fetch all orders error:", error);
    res.status(500).json({ error: "Failed to fetch store orders." });
  }
});

export default router;
