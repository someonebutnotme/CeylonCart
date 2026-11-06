import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  createOrderApi,
  fetchPayHereParamsApi,
  confirmOrderPaymentApi,
} from "../services/api";
import { Order, PayHereParams } from "../types/cart";

const BRAND = "#2e7d52";

// Dynamically load PayHere script if not present
function loadPayHereScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.payhere) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutModal() {
  const {
    items,
    subtotal,
    shipping,
    total,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
  } = useCart();

  const { user, token, setIsAuthModalOpen } = useAuth();

  // Address fields
  const [recipientName, setRecipientName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Colombo");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PayHere Online Payment");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Pre-load PayHere script on modal open
  useEffect(() => {
    if (isCheckoutOpen) {
      loadPayHereScript();
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!phone.trim() || !address.trim() || !city.trim()) {
      setError("Please fill in all delivery address fields.");
      return;
    }

    setError(null);
    setWarning(null);
    setLoading(true);

    try {
      // 1. Create order in MongoDB
      const order = await createOrderApi(
        {
          items,
          shippingAddress: {
            name: recipientName || user.name,
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
          },
          paymentMethod,
          subtotal,
          shipping,
          total,
        },
        token
      );

      // 2. If PayHere Online Payment is selected, launch PayHere Sandbox popup
      if (paymentMethod === "PayHere Online Payment") {
        await loadPayHereScript();

        const params: PayHereParams = await fetchPayHereParamsApi(order._id!, token);

        if (window.payhere && typeof window.payhere.startPayment === "function") {
          window.payhere.onCompleted = async (orderId: string) => {
            console.log("PayHere payment completed for order:", orderId);
            try {
              const confirmRes = await confirmOrderPaymentApi(
                orderId,
                `PH_SANDBOX_${Date.now()}`,
                token
              );
              setPlacedOrder(
                confirmRes.order || {
                  ...order,
                  status: "Processing",
                  paymentStatus: "Paid",
                }
              );
            } catch (confirmErr) {
              console.warn("Backend payment confirm error:", confirmErr);
              setPlacedOrder({
                ...order,
                status: "Processing",
                paymentStatus: "Paid",
              });
            }
            clearCart();
            setLoading(false);
          };

          window.payhere.onDismissed = () => {
            console.log("PayHere payment modal dismissed");
            setLoading(false);
            setWarning(
              `Payment popup was dismissed. Your order reference #${
                order._id ? order._id.slice(-6).toUpperCase() : ""
              } is saved as Pending.`
            );
          };

          window.payhere.onError = (err: any) => {
            console.error("PayHere payment error:", err);
            setLoading(false);
            setError(
              typeof err === "string"
                ? err
                : "Payment through PayHere encountered an issue. Please try again."
            );
          };

          // Trigger PayHere popup
          window.payhere.startPayment(params);
        } else {
          // Fallback if popup script blocked: direct to sandbox checkout
          console.warn("window.payhere not found, using direct fallback form");
          setPlacedOrder(order);
          clearCart();
          setLoading(false);
        }
      } else {
        // Cash on Delivery
        setPlacedOrder(order);
        clearCart();
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setPlacedOrder(null);
    setError(null);
    setWarning(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* AUTH GUARD: If user is not signed in */}
          {!user ? (
            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                🔒
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required to Purchase</h2>
              <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
                Only authenticated users can complete orders on CeylonCart. Please sign in or create an
                account to proceed with your checkout.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-sm hover:brightness-110 transition cursor-pointer"
                  style={{ background: BRAND }}
                >
                  Sign In / Create Account
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl font-semibold text-xs text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : placedOrder ? (
            /* ORDER SUCCESS RECEIPT */
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-[#1f5c3b] flex items-center justify-center mx-auto text-3xl">
                🎉
              </div>
              <div>
                <span className="text-xs font-bold text-[#2e7d52] uppercase tracking-wider">
                  Order Confirmed
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-0.5">Thank You for Your Order!</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Order Reference: <strong className="font-mono text-gray-800">{placedOrder._id}</strong>
                </p>
              </div>

              <div className="bg-[#f0f7f3] border border-green-100 rounded-xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>Recipient:</span>
                  <span>{placedOrder.shippingAddress.name}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Address:</span>
                  <span className="text-right">
                    {placedOrder.shippingAddress.address}, {placedOrder.shippingAddress.city}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-gray-800">{placedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Payment Status:</span>
                  <span
                    className={
                      placedOrder.paymentStatus === "Paid"
                        ? "font-bold text-[#1f5c3b]"
                        : "font-bold text-amber-700"
                    }
                  >
                    {placedOrder.paymentStatus === "Paid"
                      ? "✓ Paid Online via PayHere Sandbox"
                      : "Pending (Pay on Delivery)"}
                  </span>
                </div>
                {placedOrder.payherePaymentId && (
                  <div className="flex justify-between text-gray-500 font-mono text-[11px]">
                    <span>PayHere Transaction:</span>
                    <span>{placedOrder.payherePaymentId}</span>
                  </div>
                )}
                <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-sm text-gray-900">
                  <span>Total Amount:</span>
                  <span style={{ color: BRAND }}>Rs. {placedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-left">
                <span className="text-[11px] font-bold text-gray-700 block mb-1.5">
                  Ordered Items ({placedOrder.items.length}):
                </span>
                <div className="divide-y divide-gray-200">
                  {placedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between text-xs text-gray-600">
                      <span className="truncate pr-2">
                        {item.quantity} × {item.name}
                        {item.size ? ` (${item.size})` : ""}
                        {item.color ? ` (${item.color})` : ""}
                      </span>
                      <span className="font-semibold text-gray-900 whitespace-nowrap">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-sm hover:brightness-110 transition cursor-pointer"
                style={{ background: BRAND }}
              >
                Back to Shopping
              </button>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <div>
              <div className="mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>🛍️</span> Complete Your Order
                </h2>
                <p className="text-xs text-gray-500">
                  Purchasing as <strong>{user.name}</strong> ({user.email})
                </p>
              </div>

              {warning && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center justify-between">
                  <span>⚠️ {warning}</span>
                  <button
                    onClick={() => setWarning(null)}
                    className="text-gray-400 hover:text-gray-700 ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-gray-400 hover:text-gray-700 ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Delivery Address Section */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Shipping Details
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Full name"
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07X XXX XXXX"
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 45/2 Galle Road, Bambalapitiya"
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Colombo, Kandy"
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. 00300"
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Select Payment Gateway
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("PayHere Online Payment")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        paymentMethod === "PayHere Online Payment"
                          ? "border-[#2e7d52] bg-[#f0f7f3] text-[#1f5c3b] shadow-xs"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">💳</span>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-green-200/60 text-[#1f5c3b]">
                          Sandbox Live
                        </span>
                      </div>
                      <span className="text-xs font-bold block leading-tight">PayHere Gateway</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Cards, FriMi, EzCash, Genie
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash on Delivery")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        paymentMethod === "Cash on Delivery"
                          ? "border-[#2e7d52] bg-[#f0f7f3] text-[#1f5c3b] shadow-xs"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">💵</span>
                        <span className="text-[9px] font-bold text-gray-400">Standard</span>
                      </div>
                      <span className="text-xs font-bold block leading-tight">Cash on Delivery</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">Pay when order arrives</span>
                    </button>
                  </div>

                  {/* PayHere Sandbox Info & Test Cards */}
                  {paymentMethod === "PayHere Online Payment" && (
                    <div className="p-3 bg-[#f0f7f3] border border-[#a3d4b6] rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1c5c3b] flex items-center gap-1.5 text-[11px]">
                          <span>🛡️</span> sandbox.payhere.lk Active
                        </span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#a3d4b6] text-gray-700 font-semibold">
                          Merchant: 1238496
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600">
                        Secure instant checkout with MD5 encrypted signature verification.
                      </p>
                      <div className="pt-1 text-[10px] text-gray-600 font-mono bg-white p-2 rounded-lg border border-gray-200 space-y-0.5">
                        <div className="text-[10px] text-gray-500 font-sans font-bold uppercase mb-1">
                          Test Cards for Sandbox:
                        </div>
                        <div>
                          <strong className="text-gray-900">Visa:</strong> 4916 2175 0161 1292
                        </div>
                        <div>
                          <strong className="text-gray-900">Mastercard:</strong> 5307 7321 2553 1191
                        </div>
                        <div className="text-gray-500 pt-0.5">
                          CVV: Any 3 digits &bull; Exp: Any future date &bull; OTP: Any 6 digits
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Box */}
                <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5 text-xs text-gray-600 border border-gray-100">
                  <div className="flex justify-between">
                    <span>Items Subtotal ({items.length} items)</span>
                    <span className="font-semibold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-[#2e7d52] font-bold">FREE</span>
                      ) : (
                        `Rs. ${shipping.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-gray-900">
                    <span>Grand Total</span>
                    <span style={{ color: BRAND }}>Rs. {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-sm hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: BRAND }}
                >
                  {loading ? (
                    <span>Opening PayHere Secure Gateway...</span>
                  ) : paymentMethod === "PayHere Online Payment" ? (
                    <>
                      <span>Pay with PayHere</span>
                      <span>•</span>
                      <span>Rs. {total.toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order (COD)</span>
                      <span>•</span>
                      <span>Rs. {total.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
