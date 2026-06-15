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

export const WORKER_ROLES: Role[] = [
  "Admin",
  "Doctor",
  "Nurse",
  "Receptionist",
  "Pharmacist",
  "Lab Staff",
  "Cashier",
];

export function isPatient(role: Role): boolean {
  return role === "Patient";
}

export function isAdmin(role: Role): boolean {
  return role === "Admin";
}

export function isWorker(role: Role): boolean {
  return WORKER_ROLES.includes(role);
}

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string | null;
  isActive: boolean;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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

  const storeSession = (tokenValue: string, userData: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, tokenValue);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
    setLocation("/dashboard");
  };

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
    storeSession(data.token, data.user as AuthUser);
  };

  const register = async (formData: RegisterData): Promise<void> => {
    const res = await fetch(`${getApiBase()}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Registration failed" }));
      throw new Error(body.error ?? "Registration failed");
    }

    const data = await res.json();
    storeSession(data.token, data.user as AuthUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
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
