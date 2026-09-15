import { useState } from "react";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";

const BRAND = "#2e7d52";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    setIsCheckoutOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.trim().toUpperCase() === "CEYLON10") {
      setDiscountPercent(10);
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid promo code. Try 'CEYLON10'");
    }
  };

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, total - discountAmount);

  return (
    <div className="bg-[#f0f2f0] min-h-[calc(100vh-56px)] py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-900 transition no-underline text-gray-500">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">Shopping Cart</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Shopping Cart
            <span className="text-sm font-medium text-gray-500 bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-gray-500 hover:text-red-500 transition cursor-pointer flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-xl mx-auto">
            <div className="w-24 h-24 rounded-full bg-[#f0f7f3] flex items-center justify-center mx-auto text-[#2e7d52] mb-6">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Before you proceed to checkout, you must add some products to your shopping cart.
              Discover our latest flash deals, electronics, fashion, and home goods!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition hover:brightness-110 no-underline"
              style={{ background: BRAND }}
            >
              Continue Shopping
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                {/* Table Header for desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <span className="col-span-6">Product</span>
                  <span className="col-span-2 text-center">Unit Price</span>
                  <span className="col-span-2 text-center">Quantity</span>
                  <span className="col-span-2 text-right">Subtotal</span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="p-5 md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-4"
                    >
                      {/* Product details */}
                      <div className="md:col-span-6 flex items-center gap-4">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-18 h-18 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <Link
                            to="/product"
                            className="text-sm font-semibold text-gray-900 hover:text-[#2e7d52] line-clamp-2 transition no-underline block"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-xs text-red-500 hover:text-red-700 transition cursor-pointer mt-1.5 inline-flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Unit price */}
                      <div className="md:col-span-2 md:text-center text-sm font-medium text-gray-700 flex justify-between md:block">
                        <span className="md:hidden text-xs text-gray-400">Unit Price:</span>
                        <span>Rs. {item.price.toLocaleString()}</span>
                      </div>

                      {/* Quantity selector */}
                      <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                        <span className="md:hidden text-xs text-gray-400">Quantity:</span>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer text-base font-semibold"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) updateQuantity(item.productId, val);
                            }}
                            className="w-10 h-8 text-center text-xs font-semibold text-gray-800 border-x border-gray-200 focus:outline-none"
                          />
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer text-base font-semibold"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="md:col-span-2 md:text-right text-sm font-bold text-gray-900 flex justify-between md:block">
                        <span className="md:hidden text-xs text-gray-400">Total:</span>
                        <span style={{ color: BRAND }}>
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery info banner */}
              <div className="bg-[#eef7f2] border border-[#d2e9dc] rounded-xl p-4 flex items-center gap-3 text-xs text-gray-700">
                <span className="text-xl">🚚</span>
                <div>
                  <span className="font-bold text-[#1f5c3b]">
                    {shipping === 0
                      ? "Free Standard Delivery Applied!"
                      : `Add Rs. ${(5000 - subtotal).toLocaleString()} more for FREE delivery`}
                  </span>
                  <p className="text-gray-500 mt-0.5">
                    Orders over Rs. 5,000 enjoy free island-wide delivery in Sri Lanka.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Order Summary Column */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal ({itemCount})</span>
                    <span className="font-semibold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-[#2e7d52] font-bold">FREE</span>
                      ) : (
                        `Rs. ${shipping.toLocaleString()}`
                      )}
                    </span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Promo Discount ({discountPercent}%)</span>
                      <span>-Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
                    <span>Estimated Total</span>
                    <span style={{ color: BRAND }}>Rs. {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyCoupon} className="mt-5 pt-4 border-t border-gray-100">
                  <label htmlFor="coupon" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Have a promo code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="coupon"
                      type="text"
                      placeholder="e.g. CEYLON10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 uppercase focus:outline-none focus:border-[#2e7d52]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-500 mt-1">{couponError}</p>}
                  {couponApplied && (
                    <p className="text-[11px] text-green-600 font-medium mt-1">
                      ✓ Promo code &quot;CEYLON10&quot; applied (-10%)!
                    </p>
                  )}
                </form>

                {/* Checkout CTA */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full mt-6 py-3.5 rounded-xl font-bold text-sm text-white shadow-sm hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: BRAND }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Proceed to Checkout
                </button>

                {/* Guarantee info */}
                <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>🔒</span>
                    <span>Safe & Secure 256-Bit SSL Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🔄</span>
                    <span>7-Day Return Guarantee on Eligible Items</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
