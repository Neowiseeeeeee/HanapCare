import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";

export type Role =
  | "Admin"
  | "Doctor"
  | "Nurse"
  | "Receptionist"
  | "Pharmacist"
  | "Lab Staff"
  | "Cashier"
  | "Patient";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string | null;
  isActive: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "hanapcare_token";
const USER_KEY = "hanapcare_user";

function getApiBase(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await fetch(`${getApiBase()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error(body.error ?? "Login failed");
    }

    const data = await res.json();
    const authUser: AuthUser = data.user;

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setToken(data.token);
    setUser(authUser);
    setLocation("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
