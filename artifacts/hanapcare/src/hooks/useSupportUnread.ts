import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";

interface UnreadData {
  total: number;
  sessions: Record<number, number>;
}

const SUPPORT_ROLES = ["Support", "Admin"];
const POLL_INTERVAL = 12000;

export function useSupportUnread() {
  const { user, token } = useAuth();
  const [data, setData] = useState<UnreadData>({ total: 0, sessions: {} });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupport = user ? SUPPORT_ROLES.includes(user.role) : false;

  const fetchUnread = useCallback(async () => {
    if (!token || !isSupport) return;
    try {
      const res = await fetch("/api/chat/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json: UnreadData = await res.json();
        setData(json);
      }
    } catch {
      // silent — network error, retry on next poll
    }
  }, [token, isSupport]);

  useEffect(() => {
    if (!isSupport) {
      setData({ total: 0, sessions: {} });
      return;
    }
    fetchUnread();
    intervalRef.current = setInterval(fetchUnread, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSupport, fetchUnread]);

  const markSessionRead = useCallback((sessionId: number) => {
    setData((prev) => {
      const removed = prev.sessions[sessionId] ?? 0;
      const next = { ...prev.sessions };
      delete next[sessionId];
      return { total: Math.max(0, prev.total - removed), sessions: next };
    });
  }, []);

  return { total: data.total, sessions: data.sessions, markSessionRead, refresh: fetchUnread };
}
