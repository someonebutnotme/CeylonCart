import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Product, Order } from "../types/cart";
import { User } from "../types/auth";
import {
  fetchProducts,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  fetchUsersApi,
  adminChangeUserPasswordApi,
  adminDeleteUserApi,
  fetchAllOrdersApi,
} from "../services/api";

const BRAND = "#2e7d52";

const SAMPLE_IMAGES = [
  { label: "Smart Watch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&auto=format" },
  { label: "Sneakers", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop&auto=format" },
  { label: "DSLR Camera", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop&auto=format" },
  { label: "Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&auto=format" },
  { label: "Sunglass", url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop&auto=format" },
  { label: "Skincare", url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop&auto=format" },
];

export default function AdminDashboard() {
  const { user, token, isAdmin, setIsAuthModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState<"products" | "users" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [stock, setStock] = useState("30");
  const [badge, setBadge] = useState("");
  const [img, setImg] = useState(SAMPLE_IMAGES[0].url);
  const [sizesInput, setSizesInput] = useState("S, M, L, XL");
  const [colorsInput, setColorsInput] = useState("Black, Silver, Blue");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");

  // Change password modal state
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, usrList, ordList] = await Promise.all([
        fetchProducts(),
        token ? fetchUsersApi(token) : Promise.resolve([]),
        token ? fetchAllOrdersApi(token) : Promise.resolve([]),
      ]);
      setProducts(prods);
      setUsers(usrList);
      setOrders(ordList);
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAdmin && token) {
      loadData();
    }
  }, [isAdmin, token, loadData]);

  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Add product handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!name.trim() || !price) {
      alert("Product name and price are required.");
      return;
    }

    setSubmitting(true);
    try {
      const parsedSizes = sizesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedColors = colorsInput
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const newProd = await createProductApi(
        {
          name: name.trim(),
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          category,
          stock: Number(stock) || 30,
          badge: badge.trim() || undefined,
          img: img.trim() || SAMPLE_IMAGES[0].url,
          description: description.trim() || undefined,
          sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
          colors: parsedColors.length > 0 ? parsedColors : undefined,
        },
        token
      );

      setProducts((prev) => [newProd, ...prev]);
      setIsAddModalOpen(false);
      // Reset form
      setName("");
      setPrice("");
      setOriginalPrice("");
      setDescription("");
      setBadge("");
      setSizesInput("S, M, L, XL");
      setColorsInput("Black, Silver, Blue");
      showNotification(`✓ Successfully created product: "${newProd.name}"`);
    } catch (err: any) {
      alert(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  // Update product handler
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct || !editingProduct._id) return;

    try {
      const updated = await updateProductApi(
        editingProduct._id,
        {
          price: Number(editPrice),
          stock: Number(editStock),
        },
        token
      );

      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? { ...p, price: updated.price, stock: updated.stock } : p))
      );
      setEditingProduct(null);
      showNotification(`✓ Updated "${updated.name}" pricing and inventory.`);
    } catch (err: any) {
      alert(err.message || "Failed to update product");
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete "${prodName}" from inventory?`)) {
      return;
    }

    try {
      await deleteProductApi(id, token);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showNotification(`✓ Removed "${prodName}" from store inventory.`);
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  // Change user password handler
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !passwordTargetUser) return;
    const userId = passwordTargetUser.id || (passwordTargetUser as any)._id;
    if (!userId) return;

    if (!newPassword || newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await adminChangeUserPasswordApi(userId, newPassword, token);
      showNotification(`✓ ${res.message || `Password changed for ${passwordTargetUser.name}`}`);
      setPasswordTargetUser(null);
      setNewPassword("");
    } catch (err: any) {
      alert(err.message || "Failed to change user password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Delete user account handler
  const handleDeleteUser = async (userToDelete: User) => {
    if (!token) return;
    const userId = userToDelete.id || (userToDelete as any)._id;
    if (!userId) return;

    if (user && (user.id === userId || user.email === userToDelete.email)) {
      alert("You cannot delete your own logged-in admin account.");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${userToDelete.name}" (${userToDelete.email})? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminDeleteUserApi(userId, token);
      setUsers((prev) => prev.filter((u) => (u.id || (u as any)._id) !== userId));
      showNotification(`✓ Successfully deleted account for ${userToDelete.name}`);
    } catch (err: any) {
      alert(err.message || "Failed to delete user account");
    }
  };

  // Metrics
  const totalProducts = products.length;
  const totalStockUnits = useMemo(() => products.reduce((sum, p) => sum + (p.stock || 0), 0), [products]);
  const totalCatalogValue = useMemo(
    () => products.reduce((sum, p) => sum + p.price * (p.stock || 0), 0),
    [products]
  );
  const totalOrdersAmount = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total || 0), 0),
    [orders]
  );

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Access check guard
  if (!isAdmin) {
    return (
      <div className="bg-[#f0f2f0] min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            This dashboard is restricted to store administrators. Please sign in using an administrator
            account to manage inventory and store settings.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-sm hover:brightness-110 transition cursor-pointer"
              style={{ background: BRAND }}
            >
              Sign In as Administrator
            </button>
            <Link
              to="/"
              className="block text-xs font-semibold text-gray-500 hover:text-gray-800 transition no-underline"
            >
              ← Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f0] min-h-[calc(100vh-56px)] pb-12">
      {/* Top Banner */}
      <div className="bg-[#1c382b] text-white border-b border-[#2e7d52] py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-gray-950 font-extrabold text-[10px] px-2 py-0.5 rounded tracking-wide uppercase">
                Admin Portal
              </span>
              <span className="text-xs text-green-300">Live MongoDB Connected</span>
            </div>
            <h1 className="text-2xl font-bold mt-1">Store Management & Products</h1>
            <p className="text-xs text-gray-300 mt-0.5">
              Logged in as <strong>{user?.name}</strong> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 transition text-white no-underline border border-white/15"
            >
              View Storefront →
            </Link>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2e7d52] hover:brightness-110 transition text-white shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {/* Status Notification Toast */}
        {statusMessage && (
          <div className="bg-[#eaf5ee] border border-[#a3d4b6] text-[#1c5c3b] px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-gray-700">
              ✕
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Total Catalog Items</span>
              <span className="text-xl">📦</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            <span className="text-[10px] text-green-600 font-medium">Active in database</span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Total Stock Units</span>
              <span className="text-xl">📊</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalStockUnits.toLocaleString()}</p>
            <span className="text-[10px] text-gray-500">Available units</span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Orders Placed</span>
              <span className="text-xl">🛍️</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            <span className="text-[10px] text-green-600 font-medium">
              Rs. {totalOrdersAmount.toLocaleString()} total
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-semibold">Registered Accounts</span>
              <span className="text-xl">👥</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <span className="text-[10px] text-gray-500">Admins & Customers</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === "products"
                  ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Inventory & Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === "users"
                  ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Registered Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === "orders"
                  ? "bg-white text-gray-900 shadow-xs border border-gray-200"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Store Orders ({orders.length})
            </button>
          </div>

          {activeTab === "products" && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs border border-gray-200 bg-white rounded-xl px-3 py-1.5 w-56 focus:outline-none focus:border-[#2e7d52]"
              />
            </div>
          )}
        </div>

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-800">
                Products Table {searchQuery && `(Filtered: ${filteredProducts.length})`}
              </h2>
              <button
                onClick={loadData}
                className="text-xs text-[#2e7d52] hover:underline font-semibold cursor-pointer"
              >
                ↻ Refresh List
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-gray-500">Loading products catalog...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">No products found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Variants</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Stock</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod._id || prod.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <img
                            src={prod.img}
                            alt={prod.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                            {prod.badge && (
                              <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                {prod.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-medium">
                          {prod.category || "General"}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-600">
                          <div>
                            {prod.sizes && prod.sizes.length > 0 && (
                              <span className="text-gray-500 block">
                                Sizes: <strong className="text-gray-800">{prod.sizes.join(", ")}</strong>
                              </span>
                            )}
                            {prod.colors && prod.colors.length > 0 && (
                              <span className="text-gray-500 block">
                                Colors: <strong className="text-gray-800">{prod.colors.join(", ")}</strong>
                              </span>
                            )}
                            {(!prod.sizes || prod.sizes.length === 0) && (!prod.colors || prod.colors.length === 0) && (
                              <span className="text-gray-400 italic">Standard</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-900">
                            Rs. {prod.price.toLocaleString()}
                          </span>
                          {prod.originalPrice && (
                            <span className="text-[10px] text-gray-400 line-through block">
                              Rs. {prod.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-700">
                          {prod.stock !== undefined ? prod.stock : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {(prod.stock || 0) > 10 ? (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-[#1f5c3b] font-bold text-[10px]">
                              In Stock
                            </span>
                          ) : (prod.stock || 0) > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setEditPrice(String(prod.price));
                              setEditStock(String(prod.stock || 30));
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                          >
                            Edit
                          </button>
                          {prod._id && (
                            <button
                              onClick={() => handleDeleteProduct(prod._id!, prod.name)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-sm font-bold text-gray-800">User Account Management</h2>
                <p className="text-[11px] text-gray-500">
                  Manage registered store customers and administrator accounts. Reset passwords or delete accounts as required.
                </p>
              </div>
              <button
                onClick={loadData}
                className="text-xs text-[#2e7d52] hover:underline font-semibold cursor-pointer"
              >
                ↻ Refresh Users
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">User Profile</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Account Role</th>
                    <th className="px-4 py-3">Member Since</th>
                    <th className="px-4 py-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((usr) => {
                    const isSelf = user?.id === usr.id || user?.email === usr.email;
                    return (
                      <tr key={usr.id || (usr as any)._id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1c382b] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            {usr.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{usr.name}</span>
                            {isSelf && (
                              <span className="text-[9px] text-[#2e7d52] font-extrabold uppercase">
                                (Current Session)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-[11px]">{usr.email}</td>
                        <td className="px-4 py-3">
                          {usr.role === "admin" ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                              👑 Admin
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                              🛍️ Customer
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : "Seed Account"}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          {/* Change Password Button */}
                          <button
                            onClick={() => {
                              setPasswordTargetUser(usr);
                              setNewPassword("");
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition cursor-pointer"
                            title="Reset password for this user"
                          >
                            🔑 Change Password
                          </button>

                          {/* Delete Account Button */}
                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteUser(usr)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
                              title="Permanently remove this user account"
                            >
                              🗑️ Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STORE ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Store Orders History</h2>
                <p className="text-[11px] text-gray-500">
                  Live orders placed by authenticated customers in MongoDB.
                </p>
              </div>
              <button
                onClick={loadData}
                className="text-xs text-[#2e7d52] hover:underline font-semibold cursor-pointer"
              >
                ↻ Refresh Orders
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">
                No orders have been placed yet. Authenticated customers who checkout will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Purchased Items & Variants</th>
                      <th className="px-4 py-3">Shipping Address</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((ord) => (
                      <tr key={ord._id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3 font-mono text-[11px] font-bold text-gray-800">
                          #{ord._id ? ord._id.slice(-6).toUpperCase() : "ORDER"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">{ord.userName || ord.shippingAddress?.name}</p>
                          <p className="text-[10px] text-gray-500">{ord.userEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                                <span className="font-bold text-gray-800">
                                  {item.quantity}× {item.name}
                                </span>
                                {(item.size || item.color) && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-gray-100 text-gray-600 font-semibold">
                                    {[item.size, item.color].filter(Boolean).join(" / ")}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-600 max-w-[180px]">
                          <p className="truncate font-medium">{ord.shippingAddress?.address}</p>
                          <p className="text-gray-400 text-[10px]">
                            {ord.shippingAddress?.city} • {ord.shippingAddress?.phone}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          Rs. {ord.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-600">
                          {ord.paymentMethod}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                            {ord.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-gray-500">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : "Just now"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODAL: CHANGE USER PASSWORD (ADMIN) ── */}
      {passwordTargetUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setPasswordTargetUser(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <span>🔑</span> Change User Password
                </h3>
                <button
                  onClick={() => setPasswordTargetUser(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs">
                <p className="text-amber-900 font-bold">Target User Account:</p>
                <p className="text-gray-800">{passwordTargetUser.name}</p>
                <p className="text-gray-600 font-mono text-[11px]">{passwordTargetUser.email}</p>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Password (min 6 characters) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordTargetUser(null)}
                    className="px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-4 py-2 text-xs font-bold text-white rounded-lg transition hover:brightness-110 shadow-sm cursor-pointer"
                    style={{ background: BRAND }}
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW PRODUCT ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>✨</span> Add New Product to Store
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony Alpha A7 IV Camera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price (Rs.) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 54000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Original Price (Rs.)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 68000"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                    >
                      {["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Groceries", "Gaming"].map(
                        (c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                    />
                  </div>
                </div>

                {/* Variants: Sizes & Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Available Sizes (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. S, M, L, XL or US 8, US 9"
                      value={sizesInput}
                      onChange={(e) => setSizesInput(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Available Colors (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Black, White, Blue, Red"
                      value={colorsInput}
                      onChange={(e) => setColorsInput(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller, New Arrival, Official Store"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => setImg(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                  />
                  <div className="mt-2">
                    <span className="text-[10px] text-gray-500 font-semibold block mb-1">Quick Select Preset Image:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_IMAGES.map((sample) => (
                        <button
                          key={sample.label}
                          type="button"
                          onClick={() => setImg(sample.url)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer ${
                            img === sample.url ? "bg-[#2e7d52] text-white border-[#2e7d52]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe product highlights..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold text-white rounded-lg transition hover:brightness-110 shadow-sm cursor-pointer"
                    style={{ background: BRAND }}
                  >
                    {submitting ? "Saving..." : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PRODUCT ── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingProduct(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Edit Product Pricing & Stock</h3>
              <p className="text-xs text-gray-500 mb-4 truncate">{editingProduct.name}</p>

              <form onSubmit={handleUpdateProduct} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Inventory Units (Stock)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2e7d52]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white rounded-lg transition hover:brightness-110 shadow-sm cursor-pointer"
                    style={{ background: BRAND }}
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
