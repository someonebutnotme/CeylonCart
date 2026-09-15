import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { User, AuthContextType } from "../types/auth";

const USER_STORAGE_KEY = "ceyloncart_user";
const TOKEN_STORAGE_KEY = "ceyloncart_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = "/api";
const DIRECT_API_BASE = "http://localhost:5000/api";

async function authFetch(path: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (res.status === 404 || res.status === 502) {
      return await fetch(`${DIRECT_API_BASE}${path}`, options);
    }
    return res;
  } catch {
    return await fetch(`${DIRECT_API_BASE}${path}`, options);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync auth state to localStorage
  useEffect(() => {
    try {
      if (user && token) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to persist auth to localStorage", e);
    }
  }, [user, token]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed." };
      }

      setUser(data.user);
      setToken(data.token);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during login." };
    }
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: "customer" | "admin" = "customer",
      adminSecret?: string
    ) => {
      try {
        const res = await authFetch("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role, adminSecret }),
        });

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || "Registration failed." };
        }

        setUser(data.user);
        setToken(data.token);
        setIsAuthModalOpen(false);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Network error during registration." };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  const value: AuthContextType = {
    user,
    token,
    isAdmin,
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default useAuth;
