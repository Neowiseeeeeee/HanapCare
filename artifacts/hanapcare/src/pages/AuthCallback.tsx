import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ShieldAlert } from "lucide-react";
import { HanapCareLogoIcon } from "@/components/public/HanapCareLogo";
import { useAuth } from "@/lib/auth";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userRaw = params.get("user");
    const err = params.get("error");

    if (err) {
      const messages: Record<string, string> = {
        "no-account": "No HanapCare account is linked to that Google account. Please sign up first.",
        "account-inactive": "Your account has been deactivated. Please contact support.",
        "oauth-failed": "Google sign-in failed. Please try again.",
      };
      setError(messages[err] ?? "An error occurred during sign-in. Please try again.");
      return;
    }

    if (!token || !userRaw) {
      setError("Sign-in response was incomplete. Please try again.");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      loginWithToken(token, user);
    } catch {
      setError("Failed to process sign-in. Please try again.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-950 mx-auto mb-5">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign-in failed</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{error}</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-sm transition-all"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <HanapCareLogoIcon size={40} className="mx-auto mb-4" />
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Signing you in…</span>
        </div>
      </div>
    </div>
  );
}
