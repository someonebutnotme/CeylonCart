import { Link, useLocation } from "react-router";

const BRAND = "#2e7d52";

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 shadow-sm text-white" style={{ background: BRAND }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="font-[DM_Serif_Display,serif] text-2xl tracking-tight select-none text-white no-underline">
          CeylonCart
        </Link>
        <div className="flex-1 mx-2">
          <div className="flex items-center bg-white rounded overflow-hidden max-w-xl">
            <div className="flex-1 px-3 py-2 flex items-center gap-2">
              <div className="h-3 bg-[#ccd8d1] rounded-sm w-48" />
            </div>
            <button className="px-4 py-2 border-l border-green-200" style={{ background: BRAND }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <button className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" />
              <path d="M16 3H8l-1 4h10l-1-4z" />
            </svg>
            Cart
            <span className="bg-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ color: BRAND }}>3</span>
          </button>
          <button className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Account
          </button>
        </nav>
      </div>
      {/* sub-nav */}
      <div className="border-t border-white/10 bg-[#26694a]">
        <div className="max-w-6xl mx-auto px-4 h-9 flex items-center gap-6 text-xs font-medium overflow-x-auto">
          {["All Categories", "Flash Sale", "New Arrivals", "Electronics", "Fashion", "Home & Living", "Sports", "Beauty", "Groceries"].map((label) => (
            <a
              key={label}
              href="#"
              className={`whitespace-nowrap hover:text-white/90 transition ${label === "Flash Sale" ? "text-yellow-300" : "text-white/80"}`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
