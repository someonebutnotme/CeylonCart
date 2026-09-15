import { useCart } from "../context/CartContext";
import { Link } from "react-router";

const BRAND = "#2e7d52";

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 5000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#f8faf9]">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                style={{ color: BRAND }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" />
                <path d="M16 3H8l-1 4h10l-1-4z" />
              </svg>
              <h2 className="text-base font-bold text-gray-900">
                Shopping Cart{" "}
                <span className="text-xs font-semibold text-gray-500">
                  ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              aria-label="Close cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-[#f0f7f3] border-b border-green-100 text-xs">
            {remainingForFreeShipping > 0 ? (
              <div>
                <p className="text-gray-700 font-medium mb-1.5">
                  Add <span className="font-bold text-[#2e7d52]">Rs. {remainingForFreeShipping.toLocaleString()}</span> more to unlock <span className="font-bold text-[#2e7d52]">FREE Delivery</span>!
                </p>
                <div className="w-full h-1.5 bg-[#d2e7db] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%`, background: BRAND }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-[#2e7d52] font-bold flex items-center gap-1.5">
                <span>🎉</span> You unlocked FREE Delivery!
              </p>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">
                  Looks like you haven&apos;t added any items to your shopping cart yet.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:brightness-110 cursor-pointer"
                  style={{ background: BRAND }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="py-4 flex gap-4 first:pt-0">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-18 h-18 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-gray-400 hover:text-red-500 p-1 transition cursor-pointer"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xs font-bold" style={{ color: BRAND }}>
                          Rs. {item.price.toLocaleString()}
                        </span>
                        {item.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            Rs. {item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer text-sm font-semibold"
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
                          className="w-9 h-7 text-center text-xs font-semibold text-gray-800 border-x border-gray-200 focus:outline-none"
                        />
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer text-sm font-semibold"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-gray-800">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-[#fbfdfc] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>{shipping === 0 ? <strong className="text-[#2e7d52]">FREE</strong> : `Rs. ${shipping}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-gray-900">
                  <span>Total</span>
                  <span style={{ color: BRAND }}>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2.5 rounded-lg text-center font-bold text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 transition no-underline block"
                >
                  View Full Cart & Summary
                </Link>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3 rounded-lg text-center font-bold text-sm text-white shadow-sm hover:brightness-110 transition cursor-pointer"
                  style={{ background: BRAND }}
                >
                  Proceed to Checkout • Rs. {total.toLocaleString()}
                </button>
                <button
                  onClick={clearCart}
                  className="text-[11px] text-gray-400 hover:text-red-500 text-center transition cursor-pointer mt-1"
                >
                  Clear all items
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
