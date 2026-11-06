import express from "express";
import crypto from "crypto";
import Order from "../models/Order.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "1238496";
const MERCHANT_SECRET =
  process.env.PAYHERE_MERCHANT_SECRET ||
  "MTYwMTI2MTM5MzM0MDk1ODcwNDMyNDQyNjQzOTIzMjE1Njg3MTAwMw==";

// Utility: Generate PayHere MD5 hash
export function generatePayHereHash(orderId, amount, currency = "LKR") {
  const secretHash = crypto
    .createHash("md5")
    .update(MERCHANT_SECRET)
    .digest("hex")
    .toUpperCase();

  const formattedAmount = Number(amount).toFixed(2);
  const raw = MERCHANT_ID + String(orderId) + formattedAmount + currency + secretHash;

  return crypto.createHash("md5").update(raw).digest("hex").toUpperCase();
}

// POST /api/orders (Create order - Logged in users only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shipping, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cannot place order with an empty cart." });
    }

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.address ||
      !shippingAddress.phone ||
      !shippingAddress.city
    ) {
      return res.status(400).json({ error: "Complete shipping details are required." });
    }

    // Ensure valid numerical amounts to prevent MongoDB CastError
    const parsedSubtotal =
      typeof subtotal === "number" && !isNaN(subtotal) && subtotal > 0
        ? subtotal
        : items.reduce(
            (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
            0
          );

    const parsedShipping =
      typeof shipping === "number" && !isNaN(shipping)
        ? shipping
        : parsedSubtotal > 5000
        ? 0
        : 350;

    const parsedTotal =
      typeof total === "number" && !isNaN(total) && total > 0
        ? total
        : parsedSubtotal + parsedShipping;

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
      paymentStatus: "Pending",
      payherePaymentId: "",
      subtotal: parsedSubtotal,
      shipping: parsedShipping,
      total: parsedTotal,
      status: "Pending",
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to place order." });
  }
});

// POST /api/orders/:id/payhere-params (Get PayHere checkout parameters and hash)
router.post("/:id/payhere-params", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Ensure user owns this order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized access to this order." });
    }

    const formattedAmount = order.total.toFixed(2);
    const hash = generatePayHereHash(order._id.toString(), formattedAmount, "LKR");

    // Extract names
    const fullName = order.shippingAddress.name.trim();
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Perera";

    const itemsSummary = order.items
      .map((item) => `${item.name} (${item.quantity})`)
      .join(", ")
      .slice(0, 100);

    const clientOrigin = req.headers.origin || "http://localhost:8443";
    const notifyUrl = `${req.protocol}://${req.get("host")}/api/orders/payhere-notify`;

    res.json({
      sandbox: true,
      merchant_id: MERCHANT_ID,
      return_url: req.body.return_url || `${clientOrigin}/`,
      cancel_url: req.body.cancel_url || `${clientOrigin}/`,
      notify_url: notifyUrl,
      order_id: order._id.toString(),
      items: itemsSummary || "CeylonCart Goods",
      amount: formattedAmount,
      currency: "LKR",
      hash: hash,
      first_name: firstName,
      last_name: lastName,
      email: order.userEmail,
      phone: order.shippingAddress.phone,
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      country: "Sri Lanka",
      delivery_address: order.shippingAddress.address,
      delivery_city: order.shippingAddress.city,
      delivery_country: "Sri Lanka",
    });
  } catch (error) {
    console.error("PayHere params generation error:", error);
    res.status(500).json({ error: "Failed to generate PayHere parameters." });
  }
});

// PUT /api/orders/:id/payment-complete (Client marks order paid upon PayHere onCompleted)
router.put("/:id/payment-complete", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentId } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.paymentStatus = "Paid";
    order.status = "Processing";
    order.payherePaymentId = paymentId || `PH_${Date.now()}`;
    await order.save();

    res.json({ message: "Order payment confirmed.", order });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ error: "Failed to confirm payment." });
  }
});

// POST /api/orders/payhere-notify (PayHere Instant Payment Notification Webhook)
router.post("/payhere-notify", async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    console.log("PayHere notification received for order:", order_id, "Status:", status_code);

    // Verify signature
    const secretHash = crypto
      .createHash("md5")
      .update(MERCHANT_SECRET)
      .digest("hex")
      .toUpperCase();

    const expectedSig = crypto
      .createHash("md5")
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          secretHash
      )
      .digest("hex")
      .toUpperCase();

    if (expectedSig !== md5sig) {
      console.warn("PayHere signature mismatch! Received:", md5sig, "Expected:", expectedSig);
      return res.status(400).send("Signature verification failed");
    }

    const order = await Order.findById(order_id);
    if (!order) {
      console.warn("Order not found for PayHere notification:", order_id);
      return res.status(404).send("Order not found");
    }

    // status_code 2 = success
    if (String(status_code) === "2") {
      order.paymentStatus = "Paid";
      order.status = "Processing";
      order.payherePaymentId = payment_id || order.payherePaymentId;
      await order.save();
      console.log(`Order ${order_id} marked as Paid via PayHere.`);
    } else if (String(status_code) === "-1" || String(status_code) === "-2") {
      order.paymentStatus = "Failed";
      await order.save();
      console.log(`Order ${order_id} marked as Failed from PayHere.`);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("PayHere notification error:", error);
    res.status(500).send("Internal server error");
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
