import { CartItem, Product, ProductFilterParams, Order } from "../types/cart";
import { User } from "../types/auth";

// Supports both Vite reverse proxy and direct backend connection
const PROXY_BASE = "/api";
const DIRECT_BASE = "http://localhost:5000/api";

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(`${PROXY_BASE}${path}`, options);
    // If proxy returned 404/502 (e.g., if accessed from outside proxy dev server), try direct
    if (res.status === 404 || res.status === 502) {
      return await fetch(`${DIRECT_BASE}${path}`, options);
    }
    return res;
  } catch {
    // If network error on proxy, attempt direct localhost:5000
    return await fetch(`${DIRECT_BASE}${path}`, options);
  }
}

export function getSessionId(): string {
  const STORAGE_KEY = "ceyloncart_session_id";
  let sessionId = localStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    sessionId = "guest_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  return sessionId;
}

// ── PRODUCT ENDPOINTS WITH FILTERS ───────────────────────────────────────────
export async function fetchProducts(filters?: ProductFilterParams): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== "All" && filters.category !== "All Categories") {
      params.append("category", filters.category);
    }
    if (filters?.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters?.size) {
      params.append("size", filters.size);
    }
    if (filters?.color) {
      params.append("color", filters.color);
    }
    if (filters?.minPrice !== undefined && filters.minPrice !== "") {
      params.append("minPrice", String(filters.minPrice));
    }
    if (filters?.maxPrice !== undefined && filters.maxPrice !== "") {
      params.append("maxPrice", String(filters.maxPrice));
    }
    if (filters?.minRating) {
      params.append("minRating", String(filters.minRating));
    }
    if (filters?.sort) {
      params.append("sort", filters.sort);
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await apiFetch(`/products${queryString}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (err) {
    console.warn("Could not fetch products from server API, using local catalog", err);
    return [];
  }
}

export async function createProductApi(productData: Partial<Product>, token: string): Promise<Product> {
  const res = await apiFetch("/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create product");
  }
  return data;
}

export async function updateProductApi(
  id: string,
  updateData: Partial<Product>,
  token: string
): Promise<Product> {
  const res = await apiFetch(`/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update product");
  }
  return data;
}

export async function deleteProductApi(id: string, token: string): Promise<void> {
  const res = await apiFetch(`/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to delete product");
  }
}

// ── USER MANAGEMENT ENDPOINTS (ADMIN) ────────────────────────────────────────
export async function fetchUsersApi(token: string): Promise<User[]> {
  try {
    const res = await apiFetch("/auth/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch (err) {
    console.warn("Could not fetch users list:", err);
    return [];
  }
}

export async function adminChangeUserPasswordApi(
  userId: string,
  newPassword: string,
  token: string
): Promise<{ message: string }> {
  const res = await apiFetch(`/auth/users/${userId}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to change user password");
  }
  return data;
}

export async function adminDeleteUserApi(userId: string, token: string): Promise<{ message: string }> {
  const res = await apiFetch(`/auth/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete user account");
  }
  return data;
}

// ── ORDER ENDPOINTS (AUTH-GATED) ─────────────────────────────────────────────
export async function createOrderApi(orderData: Partial<Order>, token: string): Promise<Order> {
  const res = await apiFetch("/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to place order");
  }
  return data;
}

export async function fetchMyOrdersApi(token: string): Promise<Order[]> {
  try {
    const res = await apiFetch("/orders/my-orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return await res.json();
  } catch (err) {
    console.warn("Could not fetch user orders:", err);
    return [];
  }
}

export async function fetchAllOrdersApi(token: string): Promise<Order[]> {
  try {
    const res = await apiFetch("/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch all orders");
    return await res.json();
  } catch (err) {
    console.warn("Could not fetch store orders:", err);
    return [];
  }
}

// ── CART ENDPOINTS ───────────────────────────────────────────────────────────
export async function fetchCart(sessionId: string): Promise<CartItem[]> {
  try {
    const res = await apiFetch(`/cart/${sessionId}`);
    if (!res.ok) throw new Error("Failed to fetch cart");
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn("Could not fetch cart from server API:", err);
    return [];
  }
}

export async function addToCartApi(
  sessionId: string,
  item: Omit<CartItem, "quantity">,
  quantity: number = 1
): Promise<void> {
  try {
    await apiFetch(`/cart/${sessionId}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: item.productId,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        img: item.img,
        quantity,
      }),
    });
  } catch (err) {
    console.warn("Could not sync item addition to server:", err);
  }
}

export async function updateQuantityApi(
  sessionId: string,
  productId: string,
  quantity: number
): Promise<void> {
  try {
    await apiFetch(`/cart/${sessionId}/item`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
  } catch (err) {
    console.warn("Could not sync quantity update to server:", err);
  }
}

export async function removeFromCartApi(sessionId: string, productId: string): Promise<void> {
  try {
    await apiFetch(`/cart/${sessionId}/item/${encodeURIComponent(productId)}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("Could not sync item deletion to server:", err);
  }
}

export async function clearCartApi(sessionId: string): Promise<void> {
  try {
    await apiFetch(`/cart/${sessionId}/clear`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn("Could not sync cart clear to server:", err);
  }
}

export async function syncCartApi(sessionId: string, items: CartItem[]): Promise<void> {
  try {
    await apiFetch(`/cart/${sessionId}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  } catch (err) {
    console.warn("Could not sync bulk cart to server:", err);
  }
}
