import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle, ArrowRight, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { user, register } = useAuth();

  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleMsg, setGoogleMsg] = useState(false);

  useEffect(() => {
    document.title = "Create Account — HanapCare";
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const validate = () => {
    if (!form.fullName.trim()) return "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "A valid email is required";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(form.password)) return "Password must include at least one uppercase letter";
    if (!/[0-9]/.test(form.password)) return "Password must include at least one number";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (!agreed) return "Please accept the Terms & Conditions to continue";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSubmitting(true);
    setError(null);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
    } catch (err: any) {
      setError(err.message ?? "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    "Book appointments with our network of specialists",
    "Access your digital health records anywhere",
    "Transparent billing — know costs before treatment",
    "Manage your care from one place",
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col bg-gradient-to-br from-[#060D1F] via-[#0A1F4E] to-[#062040] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-teal-500/10 blur-[80px]" />

          <div className="relative z-10 flex flex-col h-full p-12">
            <Link href="/" className="flex items-center gap-2.5">
              <HanapCareLogoIcon size={38} />
              <span className="font-bold text-xl text-white">Hanap<span className="text-sky-400">Care</span></span>
            </Link>

            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-3xl font-extrabold text-white mb-3">Your health, your records.</h2>
              <p className="text-slate-400 leading-relaxed mb-10 max-w-sm">
                Create a free account and take control of your healthcare experience.
              </p>
              <div className="space-y-4">
                {benefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{b}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Your data is protected under applicable data privacy laws</span>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex items-center justify-center px-4 py-12 pt-24 lg:pt-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <HanapCareLogoIcon size={36} />
              <span className="font-bold text-xl text-slate-900">Hanap<span className="text-sky-500">Care</span></span>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
              <p className="text-slate-500 mt-1 mb-7 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-sky-600 font-semibold hover:underline">Sign in</Link>
              </p>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => setGoogleMsg(true)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm mb-5"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>

              {googleMsg && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                  Google sign-up is not yet configured. Please create your account with email and password.
                </p>
              )}

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-slate-50 text-slate-400">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Juan Dela Cruz"
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      name="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 chars, 1 uppercase, 1 number"
                      disabled={submitting}
                      className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      disabled={submitting}
                      className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer mt-2">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-sky-500" />
                  <span className="text-sm text-slate-500">
                    I agree to HanapCare's{" "}
                    <Link href="/terms" className="text-sky-600 hover:underline">Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-sky-600 hover:underline">Privacy Policy</Link>
                  </span>
                </label>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-md shadow-sky-500/20 mt-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className="text-xs text-center text-slate-400 mt-6">
                New accounts are registered as patients.{" "}
                <Link href="/login" className="text-sky-600 hover:underline">Staff sign in here →</Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
