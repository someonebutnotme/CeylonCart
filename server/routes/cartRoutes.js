import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

// Helper to get or create cart
async function getOrCreateCart(sessionId) {
  let cart = await Cart.findOne({ sessionId });
  if (!cart) {
    cart = new Cart({ sessionId, items: [] });
    await cart.save();
  }
  return cart;
}

// GET cart for session
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const cart = await getOrCreateCart(sessionId);
    res.json(cart);
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({ error: "Failed to retrieve cart" });
  }
});

// POST add item to cart
router.post("/:sessionId/add", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId, name, price, originalPrice, img, quantity = 1 } = req.body;

    if (!productId || !name || price === undefined) {
      return res.status(400).json({ error: "Missing required item fields" });
    }

    const cart = await getOrCreateCart(sessionId);
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === String(productId)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        productId: String(productId),
        name,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        img: img || "",
        quantity: Number(quantity),
      });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

// PUT update item quantity
router.put("/:sessionId/item", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: "Missing productId or quantity" });
    }

    const cart = await getOrCreateCart(sessionId);
    const parsedQty = Number(quantity);

    if (parsedQty <= 0) {
      cart.items = cart.items.filter(
        (item) => item.productId !== String(productId)
      );
    } else {
      const item = cart.items.find(
        (item) => item.productId === String(productId)
      );
      if (item) {
        item.quantity = parsedQty;
      }
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Failed to update item quantity" });
  }
});

// DELETE single item from cart
router.delete("/:sessionId/item/:productId", async (req, res) => {
  try {
    const { sessionId, productId } = req.params;
    const cart = await getOrCreateCart(sessionId);
    cart.items = cart.items.filter(
      (item) => item.productId !== String(productId)
    );
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
});

// DELETE clear all items from cart
router.delete("/:sessionId/clear", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const cart = await getOrCreateCart(sessionId);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// POST sync cart items (from client localStorage to MongoDB)
router.post("/:sessionId/sync", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { items = [] } = req.body;

    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = new Cart({ sessionId, items: [] });
    }

    // Set items to match client synced items or merge
    cart.items = items.map((item) => ({
      productId: String(item.productId),
      name: item.name,
      price: Number(item.price),
      originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
      img: item.img || "",
      quantity: Number(item.quantity) || 1,
    }));

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ error: "Failed to sync cart" });
  }
});

export default router;
