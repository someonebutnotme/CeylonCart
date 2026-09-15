export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: "customer" | "admin",
    adminSecret?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}
