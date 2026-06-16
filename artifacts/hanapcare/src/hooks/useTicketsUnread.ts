import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";

const POLL_INTERVAL = 15000;
const BADGE_ROLES = ["Support", "Admin", "Patient"];

export function useTicketsUnread() {
  const { user, token } = useAuth();
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isApplicable = user ? BADGE_ROLES.includes(user.role) : false;

  const fetch_ = useCallback(async () => {
    if (!token || !isApplicable) return;
    try {
      const res = await fetch("/api/tickets/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setCount(json.count ?? 0);
      }
    } catch {
      // silent
    }
  }, [token, isApplicable]);

  useEffect(() => {
    if (!isApplicable) { setCount(0); return; }
    fetch_();
    intervalRef.current = setInterval(fetch_, POLL_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isApplicable, fetch_]);

  const refresh = useCallback(() => { fetch_(); }, [fetch_]);

  return { count, refresh };
}
