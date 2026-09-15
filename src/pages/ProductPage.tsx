import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useCart } from "../context/CartContext";

const BRAND = "#2e7d52";
const BRAND_DARK = "#1f5c3b";
const BRAND_LIGHT = "#eaf4ee";

const DEFAULT_PRODUCT = {
  productId: "prod_headphones_1",
  name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
  price: 42500,
  originalPrice: 58000,
  rating: 4.8,
  reviews: 1107,
  img: "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=600&h=600&fit=crop&auto=format",
  category: "Electronics",
  badge: "Official Store",
  description:
    "Industry-leading noise cancellation with two processors and 8 microphones. Magnificent Sound, engineered to perfection with the new Integrated Processor V1. Up to 30-hour battery life with quick charging.",
  stock: 28,
};

const RELATED_PRODUCTS = [
  {
    name: "Apple MacBook Pro 14\" M3",
    price: 389000,
    originalPrice: 445000,
    rating: 4.9,
    reviews: 418,
    img: "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Sony Noise-Cancelling Earbuds WF-1000XM5",
    price: 28500,
    originalPrice: 34000,
    rating: 4.9,
    reviews: 832,
    img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Samsung Galaxy S25 Ultra 256GB",
    price: 219999,
    originalPrice: 271000,
    rating: 4.8,
    reviews: 1247,
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Nike Air Max 270 Running Shoes",
    price: 14999,
    originalPrice: 21500,
    rating: 4.8,
    reviews: 2341,
    img: "https://images.unsplash.com/photo-1709258228137-19a8c193be39?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "The Ordinary Skincare Bundle Set",
    price: 3850,
    originalPrice: 5200,
    rating: 4.7,
    reviews: 892,
    img: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=400&h=400&fit=crop&auto=format",
  },
];

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "text-base" : "text-xs";
  return (
    <span className={`flex gap-0.5 ${sz}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#c8d4cc" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function RatingBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-right text-[#7a9487]">{label}</span>
      <span className="text-[10px]" style={{ color: BRAND }}>★</span>
      <div className="flex-1 h-1.5 bg-[#d4ddd7] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: BRAND }} />
      </div>
      <span className="w-7 text-right text-[#7a9487]">{pct}%</span>
    </div>
  );
}

export default function ProductPage() {
  const location = useLocation();
  const { addToCart, setIsCartOpen, setIsCheckoutOpen } = useCart();

  const productData = location.state?.product || DEFAULT_PRODUCT;
  const sizes = productData.sizes && productData.sizes.length > 0 ? productData.sizes : ["Standard"];
  const colors = productData.colors && productData.colors.length > 0 ? productData.colors : ["Default"];

  const currentProduct = {
    productId: productData.productId || productData._id || productData.id || productData.name,
    name: productData.name,
    price: productData.price,
    originalPrice: productData.originalPrice,
    rating: productData.rating || 4.8,
    reviews: productData.reviews || 840,
    img: productData.img,
    badge: productData.badge,
    description: productData.description || DEFAULT_PRODUCT.description,
    stock: productData.stock || 25,
    sizes,
    colors,
  };

  const galleryImages = [
    currentProduct.img,
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop&auto=format",
  ];

  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [wishlist, setWishlist] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  const discount = currentProduct.originalPrice
    ? Math.round((1 - currentProduct.price / currentProduct.originalPrice) * 100)
    : 0;

  function handleAddToCart() {
    addToCart(currentProduct, qty, selectedSize, selectedColor);
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2200);
  }

  function handleBuyNow() {
    addToCart(currentProduct, qty, selectedSize, selectedColor);
    setIsCheckoutOpen(true);
  }

  return (
    <div className="bg-[#f0f2f0] min-h-screen">
      {/* breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-gray-900 transition no-underline text-gray-500">
          Home
        </Link>
        <span>/</span>
        <span className="hover:text-gray-900 transition">{productData.category || "Products"}</span>
        <span>/</span>
        <span className="font-semibold text-gray-900 truncate max-w-xs">{currentProduct.name}</span>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-8">
        {/* product panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 lg:grid-cols-[auto_1fr_340px] gap-6">
          {/* thumbnail strip */}
          <div className="flex lg:flex-col gap-2 lg:w-[72px] order-2 lg:order-1">
            {galleryImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition cursor-pointer"
                style={{ borderColor: activeImage === i ? BRAND : "#dde8e2" }}
              >
                <img src={src} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* main image */}
          <div className="order-1 lg:order-2 flex flex-col items-center gap-3">
            <div className="relative w-full max-w-[420px] aspect-square rounded-xl overflow-hidden border border-[#dde8e2] mx-auto bg-gray-50">
              <img
                src={galleryImages[activeImage]}
                alt={currentProduct.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow-xs">
                  −{discount}%
                </span>
              )}
              <button
                onClick={() => setWishlist(!wishlist)}
                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:scale-110 transition cursor-pointer"
                aria-label="Wishlist"
              >
                <svg
                  className="w-4 h-4 transition"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  style={{ fill: wishlist ? "#ef4444" : "none", color: wishlist ? "#ef4444" : "#9eb8ac" }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>
            <div className="flex gap-1.5">
              {galleryImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="rounded-full transition-all cursor-pointer"
                  style={{
                    width: activeImage === i ? 16 : 8,
                    height: 8,
                    background: activeImage === i ? BRAND : "#c4d4cb",
                  }}
                />
              ))}
            </div>
          </div>

          {/* product info */}
          <div className="order-3 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-[#e8f0eb] lg:pl-6 pt-4 lg:pt-0">
            <div>
              {currentProduct.badge && (
                <span
                  className="inline-block text-[11px] font-bold px-2 py-0.5 rounded text-white mb-2"
                  style={{ background: BRAND }}
                >
                  {currentProduct.badge}
                </span>
              )}
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{currentProduct.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <Stars rating={currentProduct.rating} />
              <span className="text-xs font-semibold text-gray-600">
                {currentProduct.rating} ({currentProduct.reviews} reviews)
              </span>
            </div>

            {/* Price section */}
            <div className="rounded-xl p-4 space-y-1.5 bg-[#f0f7f3] border border-green-100">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-bold text-[#1f5c3b]">
                  Rs. {currentProduct.price.toLocaleString()}
                </span>
                {currentProduct.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    Rs. {currentProduct.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#2e7d52] font-semibold">
                ✓ In Stock ({currentProduct.stock} available)
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600 pt-1">
                <span>🚚</span>
                <span>Free delivery on orders over Rs. 5,000</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed">{currentProduct.description}</p>

            {/* Color variants */}
            {colors.length > 0 && colors[0] !== "Default" && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-700">
                  Color: <strong className="text-gray-900">{selectedColor}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer font-medium ${
                        selectedColor === c
                          ? "border-[#2e7d52] bg-[#f0f7f3] text-[#1f5c3b] font-bold"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size variants */}
            {sizes.length > 0 && sizes[0] !== "Standard" && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-700">
                  Size / Option: <strong className="text-gray-900">{selectedSize}</strong>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition cursor-pointer font-medium ${
                        selectedSize === sz
                          ? "border-[#2e7d52] bg-[#2e7d52] text-white font-bold"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-base font-semibold cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={currentProduct.stock}
                    value={qty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1) setQty(val);
                    }}
                    className="w-12 h-9 text-center text-sm font-semibold text-gray-800 border-x border-gray-200 focus:outline-none"
                  />
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-base font-semibold cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  Total: <strong className="text-gray-900">Rs. {(currentProduct.price * qty).toLocaleString()}</strong>
                </span>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: cartAdded ? "#4caf76" : BRAND }}
              >
                {cartAdded ? (
                  <>
                    <span>✓</span>
                    <span>Added {qty} to Cart!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Add to Cart ({qty})</span>
                  </>
                )}
              </button>

              {/* Buy Now CTA */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3 rounded-xl font-bold text-sm transition cursor-pointer"
                style={{ border: `2px solid ${BRAND}`, color: BRAND, background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = BRAND_LIGHT)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Buy Now (Fast Checkout)
              </button>
            </div>

            {/* Seller Guarantee */}
            <div className="border border-[#dde8e2] rounded-xl p-3.5 flex items-center justify-between text-xs text-gray-600">
              <div className="space-y-1">
                <span className="font-bold text-gray-800">CeylonCart Verified Seller</span>
                <p className="text-[11px] text-gray-500">100% Authentic Product Guarantee</p>
                <div className="flex items-center gap-1.5">
                  <Stars rating={5} />
                  <span className="text-[10px] text-gray-400">98% Positive Feedback</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#eaf4ee] text-[#1f5c3b] font-bold text-[11px]">
                Top Rated
              </span>
            </div>
          </div>
        </div>

        {/* specifications & reviews tabs */}
        <div className="bg-white rounded-xl shadow-sm mt-6 overflow-hidden border border-gray-100">
          <div className="flex border-b border-[#e8f0eb]">
            {(["specs", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-4 text-sm font-semibold capitalize transition-all border-b-2 cursor-pointer"
                style={{
                  borderBottomColor: activeTab === tab ? BRAND : "transparent",
                  color: activeTab === tab ? BRAND : "#7a9487",
                }}
              >
                {tab === "specs" ? "Product Specifications" : "Customer Ratings & Reviews"}
              </button>
            ))}
          </div>

          {activeTab === "specs" && (
            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Technical Details</h3>
              <table className="w-full text-xs">
                <tbody>
                  {[
                    { key: "Brand", val: "CeylonCart Official" },
                    { key: "Model", val: currentProduct.name },
                    { key: "Condition", val: "Brand New Sealed" },
                    { key: "Warranty", val: "1 Year Official Local & International Warranty" },
                    { key: "Country of Origin", val: "Imported Authentic" },
                    { key: "Delivery Time", val: "1-3 Business Days Island-wide" },
                    { key: "Return Policy", val: "7 Days Easy Replacement" },
                    { key: "Package Contents", val: "Product Unit, Charging/Accessory Cable, User Manual, Warranty Card" },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-[#f5f8f6]" : "bg-white"}>
                      <td className="px-4 py-3 w-48 font-semibold text-gray-700">{row.key}</td>
                      <td className="px-4 py-3 text-gray-600">{row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
              <div className="flex flex-col items-center gap-2 py-4 bg-[#fbfdfc] rounded-xl p-4 border border-gray-100">
                <span className="text-4xl font-bold text-[#1f5c3b]">{currentProduct.rating}</span>
                <Stars rating={currentProduct.rating} size="md" />
                <span className="text-xs text-gray-500">Based on {currentProduct.reviews} ratings</span>
                <div className="w-full mt-4 space-y-2">
                  <RatingBar label="5" pct={82} />
                  <RatingBar label="4" pct={11} />
                  <RatingBar label="3" pct={4} />
                  <RatingBar label="2" pct={2} />
                  <RatingBar label="1" pct={1} />
                </div>
              </div>

              <div className="divide-y divide-[#e8f0eb]">
                {[
                  {
                    author: "Kasun Perera",
                    rating: 5,
                    date: "3 days ago",
                    text: "Absolutely fantastic quality! Fast delivery within 2 days in Colombo. Well packed and 100% genuine.",
                  },
                  {
                    author: "Anuki De Silva",
                    rating: 5,
                    date: "1 week ago",
                    text: "Super happy with the purchase. The sound quality and build are top-tier. Customer care was very responsive.",
                  },
                  {
                    author: "Mohamed Rizwan",
                    rating: 4,
                    date: "2 weeks ago",
                    text: "Good product and great pricing compared to retail stores. Recommended for anyone looking for authentic goods.",
                  },
                ].map((rev, i) => (
                  <div key={i} className="py-4 first:pt-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#2e7d52] text-white flex items-center justify-center text-xs font-bold">
                          {rev.author[0]}
                        </div>
                        <span className="text-xs font-bold text-gray-900">{rev.author}</span>
                        <span className="text-[10px] bg-green-100 text-[#1f5c3b] px-1.5 py-0.5 rounded font-medium">
                          Verified Buyer
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{rev.date}</span>
                    </div>
                    <Stars rating={rev.rating} />
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Similar / Related products */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-gray-900 mb-4">You May Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {RELATED_PRODUCTS.map((p) => (
              <div
                key={p.name}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition flex flex-col justify-between"
              >
                <Link to="/product" state={{ product: p }} className="block no-underline">
                  <img src={p.img} alt={p.name} className="aspect-square w-full object-cover" />
                  <div className="p-3">
                    <p className="text-xs text-gray-700 font-medium line-clamp-2 h-8">{p.name}</p>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-xs font-bold" style={{ color: BRAND }}>
                        Rs. {p.price.toLocaleString()}
                      </span>
                      {p.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">
                          Rs. {p.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="p-3 pt-0">
                  <button
                    onClick={() => addToCart(p, 1)}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold text-white transition hover:brightness-110 cursor-pointer shadow-2xs"
                    style={{ background: BRAND }}
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
