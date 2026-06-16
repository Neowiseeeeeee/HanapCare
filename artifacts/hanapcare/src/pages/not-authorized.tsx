import { Link } from "wouter";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function NotAuthorized() {
  const { user } = useAuth();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6">
        <ShieldX className="w-10 h-10 text-destructive" />
      </div>

      <h1 className="text-3xl font-extrabold text-foreground mb-2">Access Denied</h1>
      <p className="text-muted-foreground text-base max-w-md mb-2">
        You don't have permission to view this page.
      </p>
      {user && (
        <p className="text-muted-foreground/70 text-sm mb-8">
          Your current role — <span className="font-semibold text-foreground">{user.role}</span> — is not authorized
          to access this section. Contact your administrator if you believe this is an error.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-colors"
        >
          <Home className="w-4 h-4" /> Dashboard
        </Link>
      </div>
    </div>
  );
}
