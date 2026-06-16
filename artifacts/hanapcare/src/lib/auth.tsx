import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export type Role =
  | "Admin"
  | "Doctor"
  | "Nurse"
  | "Receptionist"
  | "Pharmacist"
  | "Lab Staff"
  | "Cashier"
  | "Patient"
  | "Support"
  | "HR Manager";

export const WORKER_ROLES: Role[] = [
  "Admin",
  "Doctor",
  "Nurse",
  "Receptionist",
  "Pharmacist",
  "Lab Staff",
  "Cashier",
  "Support",
  "HR Manager",
];

export function isPatient(role: Role): boolean {
  return role === "Patient";
}

export function isAdmin(role: Role): boolean {
  return role === "Admin";
}

export function isSupport(role: Role): boolean {
  return role === "Support";
}

export function isHRManager(role: Role): boolean {
  return role === "HR Manager";
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
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  bio?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  profileComplete?: boolean;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface ProfileData {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  bio?: string;
  bloodType?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  avatarUrl?: string;
  profileComplete?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithToken: (token: string, user: AuthUser) => void;
  updateProfile: (data: ProfileData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "hanapcare_token";
const USER_KEY = "hanapcare_user";

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 < Date.now();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setAuthTokenGetter(null);
    setLocation("/login");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthTokenGetter(null);
      } else {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setAuthTokenGetter(() => storedToken);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setAuthTokenGetter(null);
        }
      }
    } else {
      setAuthTokenGetter(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (currentToken) {
        logout();
      }
    };
    window.addEventListener("hanapcare:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("hanapcare:auth-expired", handleAuthExpired);
  }, []);

  useEffect(() => {
    if (!token) return;
    const payload = decodeTokenPayload(token);
    if (!payload || typeof payload.exp !== "number") return;
    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) { logout(); return; }
    const timer = setTimeout(() => { logout(); }, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [token]);

  const loginWithToken = (newToken: string, newUser: AuthUser): void => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setAuthTokenGetter(() => newToken);
    if (isPatient(newUser.role) && !newUser.profileComplete) {
      setLocation("/profile-setup");
    } else {
      setLocation("/dashboard");
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error(body.error ?? "Login failed");
    }

    const data = await res.json();
    const userData = data.user as AuthUser;

    if (!userData.isActive) {
      throw new Error("Your account has been deactivated. Please contact HR.");
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
    setAuthTokenGetter(() => data.token);

    if (isPatient(userData.role) && !userData.profileComplete) {
      setLocation("/profile-setup");
    } else {
      setLocation("/dashboard");
    }
  };

  const register = async (formData: RegisterData): Promise<void> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Registration failed" }));
      throw new Error(body.error ?? "Registration failed");
    }

    const data = await res.json();
    const userData = data.user as AuthUser;
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
    setAuthTokenGetter(() => data.token);
    setLocation("/profile-setup");
  };

  const updateProfile = async (profileData: ProfileData): Promise<void> => {
    if (!token) throw new Error("Not authenticated");
    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Update failed" }));
      throw new Error(body.error ?? "Update failed");
    }

    const updatedUser = await res.json();
    const merged = { ...user, ...updatedUser } as AuthUser;
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, loginWithToken, updateProfile, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function useAuthOptional() {
  return useContext(AuthContext);
}
