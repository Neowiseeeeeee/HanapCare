import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10">
          <HanapCareLogoIcon size={36} />
          <span className="font-bold text-xl text-slate-900">
            Hanap<span className="text-sky-500">Care</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {sent ? (
            <div className="text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Check your inbox</h1>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                If <strong className="text-slate-700">{email}</strong> is registered, we've sent a password reset link. It expires in 1 hour.
              </p>
              <p className="text-xs text-slate-400 mb-6">
                Didn't get it? Check your spam folder or{" "}
                <button
                  className="text-sky-600 font-medium hover:underline"
                  onClick={() => { setSent(false); setEmail(""); }}
                >
                  try again
                </button>.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Forgot your password?</h1>
              <p className="text-slate-500 text-sm mb-7 leading-relaxed">
                Verify your identity with Google to reset your password instantly.
              </p>

              {/* Google Reset — primary path */}
              <a
                href="/api/auth/google?mode=reset"
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 mb-4"
              >
                <GoogleIcon />
                Reset password with Google
              </a>

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-slate-50 text-slate-400">or use email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      placeholder="you@example.com"
                      disabled={submitting}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    "Send reset link by email"
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
