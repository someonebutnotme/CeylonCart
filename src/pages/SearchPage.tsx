import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router";
import { Product } from "../types/cart";
import { fetchProducts } from "../services/api";
import { useCart } from "../context/CartContext";

const BRAND = "#2e7d52";

const AVAILABLE_CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
  "Sports",
  "Groceries",
];

const AVAILABLE_COLORS = [
  { name: "Black", hex: "#1a1a1a" },
  { name: "White", hex: "#ffffff", border: true },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Titanium", hex: "#878681" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Red", hex: "#dc2626" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Green", hex: "#16a34a" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Beige", hex: "#d7c4a5" },
];

const AVAILABLE_SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "US 8",
  "US 9",
  "US 10",
  "US 11",
  "256GB",
  "512GB",
  "14-inch",
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  // URL query values
  const urlSearch = searchParams.get("q") || searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "All";
  const urlColor = searchParams.get("color") || "";
  const urlSize = searchParams.get("size") || "";
  const urlMinPrice = searchParams.get("minPrice") || "";
  const urlMaxPrice = searchParams.get("maxPrice") || "";
  const urlRating = searchParams.get("minRating") || "";
  const urlSort = (searchParams.get("sort") as any) || "newest";

  // State
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Update query params helper
  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const newParams = new URLSearchParams(searchParams);
      if (value === null || value === "" || value === "All") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  // Load products based on current search & filter parameters
  const loadFilteredProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        search: urlSearch,
        category: urlCategory,
        color: urlColor,
        size: urlSize,
        minPrice: urlMinPrice,
        maxPrice: urlMaxPrice,
        minRating: urlRating,
        sort: urlSort,
      });
      setProducts(data);
    } catch (err) {
      console.error("Failed to load filtered products", err);
    } finally {
      setLoading(false);
    }
  }, [urlSearch, urlCategory, urlColor, urlSize, urlMinPrice, urlMaxPrice, urlRating, urlSort]);

  useEffect(() => {
    loadFilteredProducts();
  }, [loadFilteredProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("q", searchInput.trim());
  };

  const handleClearAllFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    Boolean(urlSearch) ||
    (urlCategory !== "All" && Boolean(urlCategory)) ||
    Boolean(urlColor) ||
    Boolean(urlSize) ||
    Boolean(urlMinPrice) ||
    Boolean(urlMaxPrice) ||
    Boolean(urlRating);

  return (
    <div className="bg-[#f0f2f0] min-h-[calc(100vh-56px)] py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Link to="/" className="hover:text-gray-900 transition no-underline text-gray-500">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">Search & Catalog</span>
        </nav>

        {/* Search & Header Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-100">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, keyword, or brand..."
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-[#2e7d52] focus:bg-white"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateFilter("q", null);
                  }}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition hover:brightness-110 cursor-pointer"
              style={{ background: BRAND }}
            >
              Search
            </button>
          </form>

          {/* Sort & Mobile toggle */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5"
            >
              <span>⚙️</span> Filters
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Sort:</span>
              <select
                value={urlSort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#2e7d52]"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="bg-white rounded-xl p-3 mb-6 flex flex-wrap items-center gap-2 text-xs border border-gray-100 shadow-2xs">
            <span className="text-gray-500 font-bold">Active Filters:</span>

            {urlSearch && (
              <span className="bg-[#f0f7f3] border border-green-200 text-[#1f5c3b] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                Keyword: &quot;{urlSearch}&quot;
                <button onClick={() => updateFilter("q", null)} className="hover:text-red-500">✕</button>
              </span>
            )}

            {urlCategory && urlCategory !== "All" && (
              <span className="bg-[#f0f7f3] border border-green-200 text-[#1f5c3b] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                Category: {urlCategory}
                <button onClick={() => updateFilter("category", null)} className="hover:text-red-500">✕</button>
              </span>
            )}

            {urlColor && (
              <span className="bg-[#f0f7f3] border border-green-200 text-[#1f5c3b] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                Color: {urlColor}
                <button onClick={() => updateFilter("color", null)} className="hover:text-red-500">✕</button>
              </span>
            )}

            {urlSize && (
              <span className="bg-[#f0f7f3] border border-green-200 text-[#1f5c3b] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                Size: {urlSize}
                <button onClick={() => updateFilter("size", null)} className="hover:text-red-500">✕</button>
              </span>
            )}

            {(urlMinPrice || urlMaxPrice) && (
              <span className="bg-[#f0f7f3] border border-green-200 text-[#1f5c3b] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                Price: Rs. {urlMinPrice || "0"} - Rs. {urlMaxPrice || "Any"}
                <button
                  onClick={() => {
                    updateFilter("minPrice", null);
                    updateFilter("maxPrice", null);
                  }}
                  className="hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            )}

            {urlRating && (
              <span className="bg-[#f0f7f3] border border-green-200 text-[#1f5c3b] px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                {urlRating}★ & Up
                <button onClick={() => updateFilter("minRating", null)} className="hover:text-red-500">✕</button>
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              className="text-xs text-red-500 hover:text-red-700 font-bold ml-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* SIDEBAR FILTER PANEL */}
          <aside
            className={`md:block bg-white rounded-2xl shadow-sm p-5 border border-gray-100 space-y-6 ${
              mobileFiltersOpen ? "block mb-4" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <span>⚡</span> Filter Catalog
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-[11px] text-gray-400 hover:text-red-500 font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800">Category</label>
              <div className="space-y-1">
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateFilter("category", cat === "All" ? null : cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                      (urlCategory === cat || (cat === "All" && !urlCategory))
                        ? "bg-[#f0f7f3] text-[#1f5c3b] font-bold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{cat}</span>
                    {(urlCategory === cat || (cat === "All" && !urlCategory)) && (
                      <span className="text-xs font-bold text-[#2e7d52]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR FILTER */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-800">Color Variant</label>
              <div className="grid grid-cols-2 gap-1.5">
                {AVAILABLE_COLORS.map((c) => {
                  const isSelected = urlColor.toLowerCase() === c.name.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => updateFilter("color", isSelected ? null : c.name)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                        isSelected
                          ? "border-[#2e7d52] bg-[#f0f7f3] font-bold text-[#1f5c3b]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-2xs"
                        style={{
                          background: c.hex,
                          border: c.border ? "1px solid #ccc" : "none",
                        }}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZE FILTER */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-800">Size / Variant</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SIZES.map((sz) => {
                  const isSelected = urlSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateFilter("size", isSelected ? null : sz)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition cursor-pointer font-medium ${
                        isSelected
                          ? "border-[#2e7d52] bg-[#2e7d52] text-white font-bold"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRICE RANGE FILTER */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-800">Price Range (Rs.)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={urlMinPrice}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2e7d52]"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={urlMaxPrice}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2e7d52]"
                />
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  { label: "< 5k", max: "5000" },
                  { label: "5k - 25k", min: "5000", max: "25000" },
                  { label: "> 50k", min: "50000" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      updateFilter("minPrice", preset.min || null);
                      updateFilter("maxPrice", preset.max || null);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RATING FILTER */}
            <div className="space-y-2 pt-3 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-800">Customer Rating</label>
              <div className="space-y-1">
                {["4", "3"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => updateFilter("minRating", urlRating === r ? null : r)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                      urlRating === r
                        ? "bg-[#f0f7f3] text-[#1f5c3b] font-bold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="text-amber-500">★</span> {r}.0 & Above
                    </span>
                    {urlRating === r && <span className="text-[#2e7d52] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN RESULTS GRID */}
          <main className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-600 px-1">
              <p>
                Found <strong className="text-gray-900">{products.length}</strong> products
                {urlSearch ? ` for "${urlSearch}"` : ""}
              </p>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-xs text-gray-500 border border-gray-100">
                Searching catalog...
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <h3 className="text-base font-bold text-gray-800">No matching products found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  We couldn&apos;t find any products matching your specific search or filter criteria. Try
                  loosening your price range, or changing color and size filters.
                </p>
                <button
                  onClick={handleClearAllFilters}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition hover:brightness-110 cursor-pointer"
                  style={{ background: BRAND }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((p) => {
                  const discount = p.originalPrice
                    ? Math.round((1 - p.price / p.originalPrice) * 100)
                    : 0;
                  return (
                    <div
                      key={p._id || p.id || p.name}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col justify-between group"
                    >
                      <Link
                        to="/product"
                        state={{ product: p }}
                        className="block no-underline text-inherit"
                      >
                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                        </div>

                        <div className="p-3 pb-1">
                          <p className="text-xs text-gray-800 font-semibold line-clamp-2 h-8 leading-snug">
                            {p.name}
                          </p>

                          <div className="flex items-center gap-1 mt-1 text-xs">
                            <span className="text-amber-500">★</span>
                            <span className="font-semibold text-gray-700">{p.rating}</span>
                            <span className="text-[10px] text-gray-400">({p.reviews})</span>
                          </div>

                          {/* Color & Size tags */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.colors && p.colors.slice(0, 3).map((col) => (
                              <span
                                key={col}
                                className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium"
                              >
                                {col}
                              </span>
                            ))}
                            {p.sizes && p.sizes.slice(0, 2).map((sz) => (
                              <span
                                key={sz}
                                className="text-[9px] bg-green-50 text-[#1f5c3b] px-1.5 py-0.5 rounded font-medium"
                              >
                                {sz}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>

                      <div className="p-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold block" style={{ color: BRAND }}>
                            Rs. {p.price.toLocaleString()}
                          </span>
                          {p.originalPrice && (
                            <span className="text-[10px] text-gray-400 line-through block">
                              Rs. {p.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(p, 1)}
                          className="flex items-center gap-1 text-xs font-bold text-white px-2.5 py-1.5 rounded-lg transition hover:brightness-110 cursor-pointer shadow-2xs"
                          style={{ background: BRAND }}
                          title="Add to Cart"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path d="M12 4v16m8-8H4" />
                          </svg>
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
