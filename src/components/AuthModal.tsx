import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const BRAND = "#2e7d52";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "admin">("customer");
  const [adminSecret, setAdminSecret] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = async (userEmail: string, userPass: string) => {
    setError(null);
    setLoading(true);
    const result = await login(userEmail, userPass);
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const result = await login(email, password);
      setLoading(false);
      if (!result.success) {
        setError(result.error || "Login failed");
      }
    } else {
      if (!name.trim()) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }
      const result = await register(
        name,
        email,
        password,
        role,
        role === "admin" ? adminSecret : undefined
      );
      setLoading(false);
      if (!result.success) {
        setError(result.error || "Registration failed");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAuthModalOpen(false)}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
          {/* Close button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Title & Brand */}
          <div className="text-center mb-5">
            <span className="font-[DM_Serif_Display,serif] text-2xl tracking-tight" style={{ color: BRAND }}>
              CeylonCart
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {mode === "login" ? "Sign in to access your orders and account" : "Create a new account on CeylonCart"}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
            <button
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === "login" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === "register" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Logins (Only on Login Tab) */}
          {mode === "login" && (
            <div className="mb-5 p-3 bg-[#f0f7f3] border border-green-100 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1f5c3b] block">
                ⚡ Quick Demo One-Click Login:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin@ceyloncart.com", "admin123")}
                  disabled={loading}
                  className="px-2.5 py-1.5 bg-[#2e7d52] text-white text-[11px] font-bold rounded-lg hover:brightness-110 transition cursor-pointer shadow-2xs text-left truncate"
                >
                  👑 Admin Login
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("john@example.com", "customer123")}
                  disabled={loading}
                  className="px-2.5 py-1.5 bg-gray-900 text-white text-[11px] font-bold rounded-lg hover:bg-gray-800 transition cursor-pointer shadow-2xs text-left truncate"
                >
                  👤 Customer Login
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Perera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#2e7d52]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#2e7d52]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#2e7d52]"
              />
            </div>

            {mode === "register" && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-gray-700">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition cursor-pointer ${
                      role === "customer"
                        ? "border-[#2e7d52] bg-[#f0f7f3] text-[#1f5c3b]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    🛍️ Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition cursor-pointer ${
                      role === "admin"
                        ? "border-[#2e7d52] bg-[#f0f7f3] text-[#1f5c3b]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    👑 Store Admin
                  </button>
                </div>

                {role === "admin" && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Admin Passcode (Default: admin123)
                    </label>
                    <input
                      type="text"
                      value={adminSecret}
                      onChange={(e) => setAdminSecret(e.target.value)}
                      placeholder="admin123"
                      className="w-full text-xs border border-amber-300 rounded bg-white px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-bold text-xs text-white shadow-sm transition hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
              style={{ background: BRAND }}
            >
              {loading ? (
                <span>Please wait...</span>
              ) : mode === "login" ? (
                <span>Sign In to CeylonCart</span>
              ) : (
                <span>Create My Account</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
