import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const BRAND = "#2e7d52";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAdmin, logout, setIsAuthModalOpen } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearchQuery.trim())}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <header className="sticky top-0 z-30 shadow-sm text-white" style={{ background: BRAND }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Brand Logo */}
        <Link to="/" className="font-[DM_Serif_Display,serif] text-2xl tracking-tight select-none text-white no-underline">
          CeylonCart
        </Link>

        {/* Search Bar */}
        <div className="flex-1 mx-2">
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-xl overflow-hidden max-w-xl shadow-2xs">
            <div className="flex-1 px-3 py-2 flex items-center gap-2">
              <input
                type="text"
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                placeholder="Search products in CeylonCart..."
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 border-l border-green-100 cursor-pointer hover:brightness-110 transition"
              style={{ background: BRAND }}
              aria-label="Search"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>
        </div>

        {/* Right Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium">
          {/* Admin shortcut button if admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden lg:flex items-center gap-1.5 bg-amber-400 text-gray-900 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-amber-300 transition no-underline shadow-2xs"
            >
              <span>👑</span>
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition cursor-pointer relative py-1 px-2 rounded-lg hover:bg-white/10"
            aria-label="Open cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" />
              <path d="M16 3H8l-1 4h10l-1-4z" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            <span
              className="bg-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center transition-transform scale-100"
              style={{ color: BRAND }}
            >
              {itemCount}
            </span>
          </button>

          {/* Account / User Menu */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-white/10 transition cursor-pointer text-left"
              >
                <div className="w-7 h-7 rounded-full bg-white text-[#1f5c3b] flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-semibold leading-tight flex items-center gap-1">
                    {user.name.split(" ")[0]}
                    {isAdmin && (
                      <span className="text-[9px] bg-amber-400 text-gray-900 px-1 py-0.2 rounded font-bold">
                        Admin
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] opacity-75 leading-tight">{user.email}</span>
                </div>
                <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl py-1.5 text-gray-800 border border-gray-100 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 capitalize bg-[#eaf5ee] text-[#1c5c3b]">
                      Role: {user.role}
                    </span>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-[#1f5c3b] font-semibold no-underline transition"
                    >
                      <span>👑</span> Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/cart"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 text-gray-700 no-underline transition"
                  >
                    <span>🛒</span> My Cart ({itemCount})
                  </Link>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-red-50 text-red-600 transition cursor-pointer"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-xs font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <span>Sign In</span>
            </button>
          )}
        </nav>
      </div>

      {/* Sub-nav categories linking to search page */}
      <div className="border-t border-white/10 bg-[#26694a]">
        <div className="max-w-6xl mx-auto px-4 h-9 flex items-center gap-6 text-xs font-medium overflow-x-auto">
          <Link
            to="/search"
            className="whitespace-nowrap hover:text-white/90 text-white/80 no-underline transition"
          >
            All Categories
          </Link>
          {["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Groceries"].map((label) => (
            <Link
              key={label}
              to={`/search?category=${encodeURIComponent(label)}`}
              className="whitespace-nowrap hover:text-white/90 text-white/80 no-underline transition"
            >
              {label}
            </Link>
          ))}
          <Link
            to="/search?sort=price_asc"
            className="whitespace-nowrap hover:text-white/90 text-yellow-300 font-bold no-underline transition"
          >
            ⚡ Flash Sale
          </Link>
        </div>
      </div>
    </header>
  );
}
