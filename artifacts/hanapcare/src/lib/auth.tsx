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

interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("hanapcare_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (role: Role) => {
    const mockUser: User = {
      id: "usr_123",
      name: role === "Doctor" ? "Dr. Jose Rizal" : role === "Admin" ? "System Admin" : `${role} User`,
      role,
      avatar: `https://ui-avatars.com/api/?name=${role}&background=0EA5E9&color=fff`,
    };
    localStorage.setItem("hanapcare_user", JSON.stringify(mockUser));
    setUser(mockUser);
    setLocation("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("hanapcare_user");
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
