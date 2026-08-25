import { useState, useEffect } from "react";
import { Link } from "react-router";

const BRAND = "#2e7d52";
const BRAND_DARK = "#1f5c3b";
const BRAND_LIGHT = "#eaf4ee";

// ── helpers ───────────────────────────────────────────────────────────────────
function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="flex items-center gap-1">
      <span className="flex gap-0.5 text-xs">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }}>★</span>
        ))}
      </span>
      {count !== undefined && <span className="text-[10px] text-gray-400">({count})</span>}
    </span>
  );
}

function Badge({ children, color = "red" }: { children: React.ReactNode; color?: string }) {
  const bg = color === "red" ? "bg-red-500" : color === "green" ? "bg-[#2e7d52]" : "bg-amber-400";
  return <span className={`${bg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>{children}</span>;
}

// ── product card ──────────────────────────────────────────────────────────────
interface Product {
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  img: string;
  badge?: string;
  badgeColor?: string;
}

function ProductCard({ p }: { p: Product }) {
  const [wishlist, setWishlist] = useState(false);
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  return (
    <Link
      to="/product"
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group no-underline block"
    >
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={p.img}
          alt={p.name}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{discount}%
          </span>
        )}
        {p.badge && !discount && (
          <span
            className="absolute top-2 left-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: p.badgeColor || BRAND }}
          >
            {p.badge}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); setWishlist(!wishlist); }}
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:scale-110 transition opacity-0 group-hover:opacity-100"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            style={{ fill: wishlist ? "#ef4444" : "none", color: wishlist ? "#ef4444" : "#9ca3af" }}>
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-700 font-medium leading-snug line-clamp-2 mb-1.5 h-8">{p.name}</p>
        <Stars rating={p.rating} count={p.reviews} />
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-sm font-bold" style={{ color: BRAND }}>
            Rs. {p.price.toLocaleString()}
          </span>
          {p.originalPrice && (
            <span className="text-[11px] text-gray-400 line-through">Rs. {p.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, viewAll = true }: { title: string; subtitle?: string; viewAll?: boolean }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {viewAll && (
        <a href="#" className="text-xs font-semibold hover:underline transition" style={{ color: BRAND }}>
          View All →
        </a>
      )}
    </div>
  );
}

// ── countdown ─────────────────────────────────────────────────────────────────
function Countdown() {
  const [time, setTime] = useState({ h: 3, m: 47, s: 22 });
  useEffect(() => {
    const id = setInterval(() => {
      setTime((t) => {
        let { h, m, s } = t;
        s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-gray-900 text-white text-xs font-mono font-bold px-2 py-1 rounded tabular-nums min-w-[28px] text-center">
            {v}
          </span>
          {i < 2 && <span className="text-gray-500 font-bold text-sm">:</span>}
        </span>
      ))}
    </div>
  );
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const FLASH_PRODUCTS: Product[] = [
  {
    name: "Nike Air Max 270 Running Shoes",
    price: 14999, originalPrice: 21500, rating: 4.8, reviews: 2341,
    img: "https://images.unsplash.com/photo-1709258228137-19a8c193be39?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "The Ordinary Skincare Bundle Set",
    price: 3850, originalPrice: 5200, rating: 4.7, reviews: 892,
    img: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Apple MacBook Pro 14\" M3",
    price: 389000, originalPrice: 445000, rating: 4.9, reviews: 418,
    img: "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    price: 42500, originalPrice: 58000, rating: 4.8, reviews: 1107,
    img: "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Stainless Steel 5-Piece Cookware Set",
    price: 8750, originalPrice: 13200, rating: 4.5, reviews: 634,
    img: "https://images.unsplash.com/photo-1580929753603-10519c6e480a?w=400&h=400&fit=crop&auto=format",
  },
];

const FEATURED_PRODUCTS: Product[] = [
  {
    name: "Samsung Galaxy S25 Ultra 256GB",
    price: 219999, originalPrice: 271000, rating: 4.8, reviews: 1247,
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format",
    badge: "Official Store",
  },
  {
    name: "Women's Floral Summer Dress",
    price: 2990, rating: 4.6, reviews: 388,
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop&auto=format",
    badge: "Trending", badgeColor: "#d97706",
  },
  {
    name: "Makeup Brush Set — 24 Pcs Professional",
    price: 1850, originalPrice: 2800, rating: 4.5, reviews: 712,
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Cozy Minimalist Living Room Rug 160×230",
    price: 12500, originalPrice: 17000, rating: 4.7, reviews: 203,
    img: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Nike Dri-FIT Running T-Shirt",
    price: 3200, originalPrice: 4500, rating: 4.6, reviews: 956,
    img: "https://images.unsplash.com/photo-1637437757614-6491c8e915b5?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Hanging Clothes Organizer Wardrobe",
    price: 1990, rating: 4.4, reviews: 441,
    img: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=400&h=400&fit=crop&auto=format",
    badge: "New",
  },
  {
    name: "Spacejoy Indoor Plant Décor Set",
    price: 4200, rating: 4.8, reviews: 178,
    img: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop&auto=format",
    badge: "New",
  },
  {
    name: "Kitchen Cooking Pot Set — 5L",
    price: 5600, originalPrice: 7800, rating: 4.5, reviews: 329,
    img: "https://images.unsplash.com/photo-1556910633-5099dc3971e8?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Sony Noise-Cancelling Earbuds WF-1000XM5",
    price: 28500, originalPrice: 34000, rating: 4.9, reviews: 832,
    img: "https://images.unsplash.com/photo-1515940175183-6798529cb860?w=400&h=400&fit=crop&auto=format",
  },
  {
    name: "Assorted Autumn Wardrobe Bundle",
    price: 6800, originalPrice: 9900, rating: 4.4, reviews: 267,
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&auto=format",
  },
];

const NEW_ARRIVALS: Product[] = [
  {
    name: "Apple MacBook Pro 14\" Space Black",
    price: 399000, rating: 4.9, reviews: 89,
    img: "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?w=400&h=400&fit=crop&auto=format",
    badge: "Just In",
  },
  {
    name: "The Ordinary Full Skincare Routine Kit",
    price: 7200, rating: 4.7, reviews: 44,
    img: "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=400&h=400&fit=crop&auto=format",
    badge: "Just In",
  },
  {
    name: "Minimalist Living Room Accent Chair",
    price: 28000, rating: 4.6, reviews: 17,
    img: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop&auto=format",
    badge: "Just In",
  },
  {
    name: "Nike Air Max 2026 Limited Edition",
    price: 19500, rating: 4.8, reviews: 63,
    img: "https://images.unsplash.com/photo-1709258228137-19a8c193be39?w=400&h=400&fit=crop&auto=format",
    badge: "Just In",
  },
  {
    name: "Stainless Steel Cookware — Chef Pro",
    price: 11200, rating: 4.5, reviews: 28,
    img: "https://images.unsplash.com/photo-1580929753603-10519c6e480a?w=400&h=400&fit=crop&auto=format",
    badge: "Just In",
  },
];

const CATEGORIES = [
  { icon: "📱", label: "Electronics", color: "#dbeafe" },
  { icon: "👕", label: "Fashion", color: "#fce7f3" },
  { icon: "🏠", label: "Home & Living", color: "#fef3c7" },
  { icon: "💄", label: "Beauty", color: "#fde8f0" },
  { icon: "⚽", label: "Sports", color: "#dcfce7" },
  { icon: "🍎", label: "Groceries", color: "#ffedd5" },
  { icon: "📚", label: "Books", color: "#ede9fe" },
  { icon: "🎮", label: "Gaming", color: "#e0e7ff" },
];

const BRANDS = ["Samsung", "Apple", "Nike", "Sony", "L'Oréal", "Philips"];

// ── component ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="bg-[#f0f2f0] min-h-screen">
      <main className="max-w-6xl mx-auto px-4 pb-12 pt-4 space-y-6">

        {/* ── HERO ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
          <div className="relative rounded-2xl overflow-hidden min-h-[280px] group">
            <img
              src="https://images.unsplash.com/photo-1727407209320-1fa6ae60ee05?w=900&h=420&fit=crop&auto=format"
              alt="Season Sale"
              className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
            <div className="relative z-10 p-8 flex flex-col justify-center h-full min-h-[280px]">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-300 mb-2">
                End of Season Sale
              </span>
              <h1 className="text-3xl font-bold text-white leading-tight mb-2 max-w-xs">
                Up to <span className="text-amber-300">70% Off</span> on Top Brands
              </h1>
              <p className="text-white/70 text-sm mb-5 max-w-xs">
                Electronics, Fashion, Home & more. Limited time deals every day.
              </p>
              <Link
                to="/product"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white w-fit transition-all hover:brightness-110 no-underline"
                style={{ background: BRAND }}
              >
                Shop Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="flex lg:flex-col gap-3">
            <div className="relative flex-1 rounded-2xl overflow-hidden min-h-[130px] group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=220&fit=crop&auto=format"
                alt="Fashion"
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative z-10 p-4 flex flex-col justify-end h-full min-h-[130px]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">New Collection</span>
                <p className="text-white font-bold text-sm leading-tight">Fashion & Lifestyle</p>
              </div>
            </div>
            <div className="relative flex-1 rounded-2xl overflow-hidden min-h-[130px] group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=220&fit=crop&auto=format"
                alt="Electronics"
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative z-10 p-4 flex flex-col justify-end h-full min-h-[130px]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300">Mega Deals</span>
                <p className="text-white font-bold text-sm leading-tight">Electronics & Gadgets</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRUST STRIP ── */}
        <div className="bg-white rounded-xl shadow-sm px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🚚", title: "Free Delivery", sub: "On orders over Rs. 5,000" },
            { icon: "🔄", title: "Easy Returns", sub: "7-day hassle-free returns" },
            { icon: "🔒", title: "Secure Payment", sub: "100% protected checkout" },
            { icon: "🎧", title: "24/7 Support", sub: "Dedicated customer care" },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-xs font-bold text-gray-800">{title}</p>
                <p className="text-[11px] text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CATEGORIES ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <SectionHeader title="Shop by Category" subtitle="Find what you're looking for" />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {CATEGORIES.map(({ icon, label, color }) => (
              <a key={label} href="#" className="flex flex-col items-center gap-2 group no-underline">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 group-hover:scale-110 group-hover:shadow-md"
                  style={{ background: color }}
                >
                  {icon}
                </div>
                <span className="text-[11px] font-medium text-gray-600 text-center leading-tight group-hover:text-[#2e7d52] transition-colors">
                  {label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ── FLASH SALE ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h2 className="text-lg font-bold text-gray-900">Flash Sale</h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>Ends in</span>
                <Countdown />
              </div>
            </div>
            <a href="#" className="text-xs font-semibold hover:underline transition" style={{ color: BRAND }}>
              View All →
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {FLASH_PRODUCTS.map((p) => <ProductCard key={p.name} p={p} />)}
          </div>
        </div>

        {/* ── PROMO BANNERS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative rounded-xl overflow-hidden h-28 group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=200&fit=crop&auto=format"
              alt="Beauty"
              className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/70 to-transparent" />
            <div className="relative z-10 p-4 h-full flex flex-col justify-center">
              <p className="text-white font-bold text-sm">Beauty Essentials</p>
              <p className="text-white/70 text-xs">Up to 40% off skincare</p>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden h-28 group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1637437757614-6491c8e915b5?w=500&h=200&fit=crop&auto=format"
              alt="Sports"
              className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-transparent" />
            <div className="relative z-10 p-4 h-full flex flex-col justify-center">
              <p className="text-white font-bold text-sm">Sports & Fitness</p>
              <p className="text-white/70 text-xs">Gear up for your goals</p>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden h-28 group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=500&h=200&fit=crop&auto=format"
              alt="Home"
              className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 to-transparent" />
            <div className="relative z-10 p-4 h-full flex flex-col justify-center">
              <p className="text-white font-bold text-sm">Home & Living</p>
              <p className="text-white/70 text-xs">Transform your space</p>
            </div>
          </div>
        </div>

        {/* ── FEATURED PRODUCTS ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <SectionHeader title="Featured Products" subtitle="Handpicked deals just for you" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {FEATURED_PRODUCTS.map((p) => <ProductCard key={p.name} p={p} />)}
          </div>
        </div>

        {/* ── BRANDS ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <SectionHeader title="Top Brands" subtitle="Authentic products, guaranteed" viewAll={false} />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {BRANDS.map((brand) => (
              <a
                key={brand}
                href="#"
                className="rounded-xl border border-gray-100 py-4 flex items-center justify-center hover:border-[#b2d4bf] hover:bg-[#f0f7f3] transition-all cursor-pointer no-underline"
              >
                <span className="text-sm font-bold text-gray-500 tracking-tight">{brand}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── NEW ARRIVALS ── */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <SectionHeader title="New Arrivals" subtitle="Fresh drops this week" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {NEW_ARRIVALS.map((p) => <ProductCard key={p.name} p={p} />)}
          </div>
        </div>

        {/* ── APP DOWNLOAD BANNER ── */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a2e22 0%, #2e7d52 100%)" }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 60%)" }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 py-8 gap-6">
            <div>
              <div className="flex gap-3">
                <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition no-underline">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div>
                    <p className="text-[9px] text-gray-400 leading-none">Download on the</p>
                    <p className="text-xs font-bold leading-snug">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition no-underline">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.76c.3.17.64.22.99.13l.11-.06 11.09-6.42-2.42-2.43-9.77 8.78zm14.53-8.41l2.43-1.41a1.07 1.07 0 000-1.86L17.7 10.66l-2.63 2.63 2.64 2.06zM2.08 1.07L13.71 12.7 2.19.93a.97.97 0 00-.11-.06A1.05 1.05 0 002.08 1.07zm11.86 10.93L2.35.49l-.05-.04C2.2.4 2.1.38 2 .38L13.94 11.99l.12-.12-.12.13z"/>
                  </svg>
                  <div>
                    <p className="text-[9px] text-gray-400 leading-none">Get it on</p>
                    <p className="text-xs font-bold leading-snug">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
            <div className="hidden md:block relative w-40 h-40 flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1600856209809-8419414d351f?w=300&h=300&fit=crop&auto=format"
                alt="CeylonCart app"
                className="w-full h-full object-cover rounded-2xl border-4 border-white/20 shadow-2xl"
              />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
