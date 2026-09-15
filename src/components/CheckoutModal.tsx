import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrderApi } from "../services/api";
import { Order } from "../types/cart";

const BRAND = "#2e7d52";

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
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

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
    setLoading(true);

    try {
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

      setPlacedOrder(order);
      clearCart();
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setPlacedOrder(null);
    setError(null);
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
                  <span>{placedOrder.paymentMethod}</span>
                </div>
                <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-sm text-gray-900">
                  <span>Total Paid:</span>
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

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
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
                    Payment Option
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Cash on Delivery", icon: "💵", label: "Cash on Delivery" },
                      { id: "Credit / Debit Card", icon: "💳", label: "Online Card" },
                      { id: "Koko (3 Installments)", icon: "✨", label: "Koko Pay" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPaymentMethod(opt.id)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          paymentMethod === opt.id
                            ? "border-[#2e7d52] bg-[#f0f7f3] text-[#1f5c3b] font-bold"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-base block mb-0.5">{opt.icon}</span>
                        <span className="text-[10px] leading-tight block">{opt.label}</span>
                      </button>
                    ))}
                  </div>
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
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Place Order</span>
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
