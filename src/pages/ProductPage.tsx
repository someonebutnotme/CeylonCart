import { useState } from "react";
import { Link } from "react-router";

const BRAND = "#2e7d52";
const BRAND_DARK = "#1f5c3b";
const BRAND_LIGHT = "#eaf4ee";

function ImgBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-[#d4ddd7] flex items-center justify-center ${className}`}>
      <svg className="w-1/3 h-1/3 text-[#a8bdb0] opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

function TextBar({ w = "full", h = "3", className = "" }: { w?: string; h?: string; className?: string }) {
  const width = w === "full" ? "w-full" : `w-[${w}]`;
  return <div className={`h-${h} bg-[#ccd8d1] rounded-sm ${width} ${className}`} />;
}

function TextParagraph({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  const widths = ["100%", "90%", "75%", "95%", "60%", "85%"];
  return (
    <div className={`space-y-1.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-2.5 bg-[#ccd8d1] rounded-sm" style={{ width: widths[i % widths.length] }} />
      ))}
    </div>
  );
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "text-base" : "text-xs";
  return (
    <span className={`flex gap-0.5 ${sz}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= rating ? BRAND : "#c8d4cc" }}>★</span>
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

const THUMB_COUNT = 4;
const SPEC_ROWS = 12;
const REVIEW_COUNT = 3;
const SIMILAR_COUNT = 5;

export default function ProductPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  function handleAddToCart() {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  }

  return (
    <div className="bg-[#f0f2f0] min-h-screen">
      {/* breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1.5">
        {[40, 64, 44, 52].map((w, i, arr) => (
          <span key={i} className="flex items-center gap-1.5">
            <div className="h-2.5 bg-[#b8ccbf] rounded-sm" style={{ width: w }} />
            {i < arr.length - 1 && <span className="text-[#b8ccbf] text-xs">/</span>}
          </span>
        ))}
        <span className="text-[#b8ccbf] text-xs">/</span>
        <div className="h-2.5 bg-[#b8ccbf] rounded-sm w-36" />
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-8">
        {/* product panel */}
        <div className="bg-white rounded-lg shadow-sm p-5 grid grid-cols-1 lg:grid-cols-[auto_1fr_300px] gap-6">
          {/* thumbnail strip */}
          <div className="flex lg:flex-col gap-2 lg:w-[72px] order-2 lg:order-1">
            {Array.from({ length: THUMB_COUNT }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className="w-16 h-16 rounded overflow-hidden flex-shrink-0 border-2 transition"
                style={{ borderColor: activeImage === i ? BRAND : "#dde8e2" }}
              >
                <ImgBlock className="w-full h-full" />
              </button>
            ))}
          </div>

          {/* main image */}
          <div className="order-1 lg:order-2 flex flex-col items-center gap-3">
            <div className="relative w-full max-w-[420px] aspect-square rounded-lg overflow-hidden border border-[#dde8e2] mx-auto">
              <ImgBlock className="w-full h-full" />
              <span className="absolute top-3 left-3 bg-red-400 text-white text-[10px] font-bold px-2 py-0.5 rounded">−19%</span>
              <button
                onClick={() => setWishlist(!wishlist)}
                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:scale-110 transition"
              >
                <svg className="w-4 h-4 transition" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  style={{ fill: wishlist ? "#e05252" : "none", color: wishlist ? "#e05252" : "#9eb8ac" }}>
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: THUMB_COUNT }).map((_, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className="rounded-full transition-all"
                  style={{ width: activeImage === i ? 16 : 8, height: 8, background: activeImage === i ? BRAND : "#c4d4cb" }} />
              ))}
            </div>
          </div>

          {/* product info */}
          <div className="order-3 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-[#e8f0eb] lg:pl-5 pt-4 lg:pt-0">
            <div className="space-y-2">
              <div className="inline-block h-4 w-24 rounded" style={{ background: BRAND_LIGHT }} />
              <TextBar w="full" h="4" />
              <TextBar w="85%" h="4" />
            </div>
            <div className="flex items-center gap-2">
              <Stars rating={5} />
              <div className="h-2.5 bg-[#ccd8d1] rounded-sm w-28" />
            </div>
            <div className="rounded-lg p-3 space-y-1.5" style={{ background: BRAND_LIGHT }}>
              <div className="flex items-baseline gap-2">
                <div className="h-7 w-32 rounded" style={{ background: "#b2d4bf" }} />
                <div className="h-4 w-20 bg-[#ccd8d1] rounded-sm" />
              </div>
              <div className="h-2.5 w-40 rounded-sm" style={{ background: "#9ecab0" }} />
              <div className="flex items-center gap-1 mt-1">
                <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#7ab896" }} />
                <div className="h-2.5 w-44 bg-[#ccd8d1] rounded-sm" />
              </div>
            </div>
            <div className="border border-[#dde8e2] rounded-lg p-3 space-y-2">
              {[160, 180, 150].map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: BRAND_LIGHT, border: `1.5px solid ${BRAND}` }} />
                  <div className="h-2.5 bg-[#ccd8d1] rounded-sm" style={{ width: w }} />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-12 bg-[#ccd8d1] rounded-sm" />
                <div className="h-2.5 w-20 bg-[#b8ccbf] rounded-sm" />
              </div>
              <div className="flex gap-2">
                {["#2a2a2a", "#c0c0c0", "#7fa87f"].map((hex, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2"
                    style={{ background: hex, borderColor: i === 0 ? BRAND : "#dde8e2" }} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-3 w-8 bg-[#ccd8d1] rounded-sm" />
                <div className="flex items-center border border-[#dde8e2] rounded overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 text-gray-500 hover:bg-gray-100 transition text-lg leading-none">−</button>
                  <span className="w-9 text-center text-sm font-medium text-gray-700">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-8 h-8 text-gray-500 hover:bg-gray-100 transition text-lg leading-none">+</button>
                </div>
                <div className="h-2.5 w-16 bg-[#ccd8d1] rounded-sm" />
              </div>
              <button onClick={handleAddToCart} className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all"
                style={{ background: cartAdded ? "#4caf76" : BRAND }}>
                {cartAdded ? "✓ Added to Cart" : "Add to Cart"}
              </button>
              <button className="w-full py-2.5 rounded-lg font-semibold text-sm transition"
                style={{ border: `2px solid ${BRAND}`, color: BRAND, background: "transparent" }}
                onMouseEnter={e => (e.currentTarget.style.background = BRAND_LIGHT)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                Buy Now
              </button>
            </div>
            <div className="border border-[#dde8e2] rounded-lg p-3 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-2 w-10 bg-[#b8ccbf] rounded-sm" />
                <div className="h-3 w-36 bg-[#ccd8d1] rounded-sm" />
                <div className="flex items-center gap-1.5">
                  <Stars rating={5} />
                  <div className="h-2.5 w-20 bg-[#ccd8d1] rounded-sm" />
                </div>
              </div>
              <div className="h-3 w-16 rounded-sm" style={{ background: BRAND_LIGHT }} />
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="bg-white rounded-lg shadow-sm mt-4 overflow-hidden">
          <div className="flex border-b border-[#e8f0eb]">
            {(["specs", "reviews"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-6 py-3.5 text-sm font-semibold capitalize transition-all border-b-2"
                style={{ borderBottomColor: activeTab === tab ? BRAND : "transparent", color: activeTab === tab ? BRAND : "#7a9487" }}>
                {tab === "specs" ? "Specifications" : "Ratings & Reviews"}
              </button>
            ))}
          </div>
          {activeTab === "specs" && (
            <div className="p-5">
              <div className="h-5 w-44 bg-[#ccd8d1] rounded mb-4" />
              <table className="w-full">
                <tbody>
                  {Array.from({ length: SPEC_ROWS }).map((_, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-[#f5f8f6]" : "bg-white"}>
                      <td className="px-4 py-2.5 w-40 md:w-56">
                        <div className="h-2.5 bg-[#b8ccbf] rounded-sm w-20" />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="h-2.5 bg-[#ccd8d1] rounded-sm" style={{ width: `${50 + (i * 17) % 40}%` }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="h-12 w-16 rounded" style={{ background: "#b2d4bf" }} />
                <Stars rating={5} size="md" />
                <div className="h-2.5 w-20 bg-[#ccd8d1] rounded-sm" />
                <div className="w-full mt-3 space-y-1.5">
                  <RatingBar label="5" pct={82} />
                  <RatingBar label="4" pct={11} />
                  <RatingBar label="3" pct={4} />
                  <RatingBar label="2" pct={2} />
                  <RatingBar label="1" pct={1} />
                </div>
              </div>
              <div className="divide-y divide-[#e8f0eb]">
                {Array.from({ length: REVIEW_COUNT }).map((_, i) => (
                  <div key={i} className="py-4 first:pt-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full" style={{ background: BRAND_LIGHT, border: `1.5px solid ${BRAND}` }} />
                        <div className="h-3 w-24 bg-[#ccd8d1] rounded-sm" />
                        <div className="h-3 w-12 rounded-sm" style={{ background: BRAND_LIGHT }} />
                      </div>
                      <div className="h-2.5 w-16 bg-[#ccd8d1] rounded-sm" />
                    </div>
                    <Stars rating={i === 1 ? 4 : 5} />
                    <div className="h-3 w-40 bg-[#b8ccbf] rounded-sm mt-2 mb-2" />
                    <TextParagraph lines={3} />
                  </div>
                ))}
                <div className="pt-4">
                  <div className="h-3 w-32 rounded-sm" style={{ background: BRAND_LIGHT }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* similar products */}
        <div className="mt-4">
          <div className="h-5 w-40 bg-[#ccd8d1] rounded mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: SIMILAR_COUNT }).map((_, i) => (
              <Link to="/product" key={i} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer no-underline">
                <ImgBlock className="aspect-square w-full" />
                <div className="p-2.5 space-y-1.5">
                  <TextBar w="full" h="2.5" />
                  <TextBar w="75%" h="2.5" />
                  <Stars rating={i % 2 === 0 ? 5 : 4} />
                  <div className="h-3.5 w-24 rounded-sm" style={{ background: "#b2d4bf" }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
