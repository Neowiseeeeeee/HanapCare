import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MascotButtonProps {
  onClick: () => void;
  unread?: number;
}

const MESSAGES = [
  "Need help? 👋",
  "Ask me anything!",
  "How can I help? 😊",
  "Book an appointment!",
  "I'm here for you! 💙",
];

function PulseRing({ delay }: { delay: number }) {
  return (
    <motion.span
      aria-hidden
      style={{
        position: "absolute",
        inset: "-14px",
        borderRadius: "50%",
        border: "2.5px solid rgba(56, 189, 248, 0.7)",
        pointerEvents: "none",
      }}
      animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
      transition={{
        duration: 1.6,
        ease: "easeOut",
        repeat: Infinity,
        repeatDelay: 2.4,
        delay,
      }}
    />
  );
}

export default function MascotButton({ onClick, unread = 0 }: MascotButtonProps) {
  const SIZE = 68;

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isFloating, setIsFloating] = useState(true);
  const [bubble, setBubble] = useState<string | null>(null);
  const isDragging = useRef(false);
  const didMove = useRef(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const msgIndex = useRef(0);

  useEffect(() => {
    setPos({
      x: window.innerWidth - SIZE - 20,
      y: window.innerHeight - SIZE - 20,
    });
  }, []);

  useEffect(() => {
    const show = () => {
      const msg = MESSAGES[msgIndex.current % MESSAGES.length];
      msgIndex.current += 1;
      setBubble(msg);
      setTimeout(() => setBubble(null), 3200);
    };

    const initialDelay = setTimeout(show, 4000);
    const interval = setInterval(show, 13000);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    didMove.current = false;
    setIsFloating(false);
    setBubble(null);
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    didMove.current = true;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - SIZE, e.clientX - dragOffset.current.dx)),
      y: Math.max(0, Math.min(window.innerHeight - SIZE, e.clientY - dragOffset.current.dy)),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    setIsFloating(true);
    if (!didMove.current) onClick();
  }, [onClick]);

  if (!pos) return null;

  return (
    <motion.button
      aria-label="Open chat support"
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        touchAction: "none",
        userSelect: "none",
        zIndex: 50,
        width: SIZE,
        height: SIZE,
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: isDragging.current ? "grabbing" : "grab",
      }}
      animate={isFloating ? { y: [0, -8, 0] } : { y: 0 }}
      transition={isFloating ? { repeat: Infinity, duration: 2.8, ease: "easeInOut" } : undefined}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.93 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble}
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              right: 0,
              whiteSpace: "nowrap",
              background: "white",
              color: "#0f172a",
              fontSize: "12px",
              fontWeight: 600,
              padding: "6px 11px",
              borderRadius: "14px 14px 4px 14px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {bubble}
            <span
              style={{
                position: "absolute",
                bottom: "-6px",
                right: "10px",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "0px solid transparent",
                borderTop: "7px solid white",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative w-full h-full"
        style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.28))" }}
      >
        <PulseRing delay={0} />
        <PulseRing delay={0.9} />

        <img
          src="/logo.png"
          alt="HanapCare"
          draggable={false}
          className="w-full h-full select-none relative"
          style={{ objectFit: "contain", zIndex: 1 }}
        />

        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md"
            style={{ zIndex: 2 }}
          >
            {unread > 99 ? "99+" : unread}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
