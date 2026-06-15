import { useEffect, useState } from "react";
import { Database, Key, Terminal, CheckCircle2, AlertCircle } from "lucide-react";

type HealthStatus = "loading" | "ok" | "needs-setup" | "api-down";

export function SetupScreen({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<HealthStatus>("loading");

  useEffect(() => {
    fetch("/api/healthz")
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.dbConfigured ? "ok" : "needs-setup");
      })
      .catch(() => {
        setStatus("api-down");
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
          <p className="text-sm">Starting HanapCare…</p>
        </div>
      </div>
    );
  }

  if (status === "ok") {
    return <>{children}</>;
  }

  const isApiDown = status === "api-down";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <Database className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">HanapCare</h1>
            <p className="text-slate-400 text-xs mt-0.5">Setup required</p>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-3 mb-5">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-white font-semibold mb-1">
                {isApiDown ? "API server is unreachable" : "Database not connected"}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {isApiDown
                  ? "The API server could not be reached. Make sure it is running on port 8080."
                  : "This app requires a Neon PostgreSQL database. Replit's built-in database is not used — you must provide your own Neon connection string."}
              </p>
            </div>
          </div>

          {!isApiDown && (
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Create a free Neon database</p>
                  <p className="text-slate-400 text-xs">
                    Go to{" "}
                    <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                      neon.tech
                    </a>{" "}
                    → create a project → copy the connection string from the Connection Details panel.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Add the secret to Replit</p>
                  <p className="text-slate-400 text-xs mb-2">
                    In the Replit sidebar, open <strong className="text-slate-300">Secrets</strong> and add:
                  </p>
                  <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <code className="text-sky-300 text-xs">NEON_DATABASE_URL</code>
                    <span className="text-slate-600 text-xs ml-1">= your connection string</span>
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Push schema &amp; seed demo data</p>
                  <p className="text-slate-400 text-xs mb-2">
                    Open the Replit Shell and run these two commands:
                  </p>
                  <div className="space-y-1.5">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <code className="text-green-300 text-xs">pnpm --filter @workspace/db run push</code>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <code className="text-green-300 text-xs">pnpm --filter @workspace/scripts run seed</code>
                    </div>
                  </div>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">Restart the workflows</p>
                  <p className="text-slate-400 text-xs">
                    Click <strong className="text-slate-300">Stop</strong> then <strong className="text-slate-300">Run</strong> in Replit to restart both the API server and frontend.
                  </p>
                </div>
              </li>
            </ol>
          )}
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="text-slate-400 text-xs leading-relaxed">
            <strong className="text-slate-300">Why Neon?</strong> This project is designed to deploy on Render with a Neon PostgreSQL database. Replit's built-in database is intentionally not used so your data is portable across deployments and Replit accounts.
          </p>
        </div>
      </div>
    </div>
  );
}
