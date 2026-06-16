import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) setLocation("/dashboard");
  }, [user, isLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message ?? "Sign in failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col bg-[#060D1F] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-600/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-teal-600/10 blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          <Link href="/" className="flex items-center gap-2.5">
            <HanapCareLogoIcon size={38} />
            <span className="font-bold text-xl text-white">
              Hanap<span className="text-sky-400">Care</span>
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <h2 className="text-3xl font-extrabold text-white mb-3 leading-tight">
              Welcome back.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-10">
              Your health journey continues here. Sign in to access your dashboard, appointments, records, and more.
            </p>

            <div className="space-y-5">
              {[
                { icon: "🏥", text: "View and book appointments in seconds" },
                { icon: "📋", text: "Access your complete health history" },
                { icon: "💊", text: "Track prescriptions and lab results" },
                { icon: "💳", text: "Review billing with full transparency" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-slate-400 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} HanapCare Technologies, Inc.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex items-center justify-center px-4 py-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <HanapCareLogoIcon size={36} />
            <span className="font-bold text-xl text-slate-900 dark:text-white">
              Hanap<span className="text-sky-500">Care</span>
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Sign in</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 mb-7 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-sky-500 font-semibold hover:underline">
                Create one
              </Link>
            </p>

            {/* Google Button */}
            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </a>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white dark:bg-slate-950 text-slate-400 dark:text-slate-500">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="you@example.com"
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-400/20 dark:focus:ring-sky-500/20 transition-all disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-sky-500 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder="••••••••"
                    disabled={submitting}
                    className="w-full px-4 py-3 pr-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-400/20 dark:focus:ring-sky-500/20 transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-md shadow-sky-500/20 mt-1"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-6">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-sky-500 hover:underline">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-sky-500 hover:underline">Privacy Policy</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
