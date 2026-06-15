import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Activity, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@hanapcare.ph", password: "Admin@1234" },
  { label: "Doctor", email: "doctor@hanapcare.ph", password: "Doctor@1234" },
  { label: "Nurse", email: "nurse@hanapcare.ph", password: "Nurse@1234" },
  { label: "Receptionist", email: "receptionist@hanapcare.ph", password: "Recept@1234" },
  { label: "Pharmacist", email: "pharmacist@hanapcare.ph", password: "Pharma@1234" },
  { label: "Lab Staff", email: "lab@hanapcare.ph", password: "Lab@12345" },
  { label: "Cashier", email: "cashier@hanapcare.ph", password: "Cash@1234" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (acc: { email: string; password: string }) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Activity className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">HanapCare</h1>
          <p className="text-muted-foreground mt-1">Hospital Management System</p>
        </div>

        <Card className="border-border/50 shadow-xl bg-background/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@hanapcare.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={submitting}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Demo accounts</p>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <Button
                    key={acc.label}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 justify-start"
                    onClick={() => fillDemo(acc)}
                    disabled={submitting}
                  >
                    {acc.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
