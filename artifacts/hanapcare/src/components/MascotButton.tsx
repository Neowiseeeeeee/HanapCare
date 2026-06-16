import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Expression = "normal" | "blink" | "wink" | "surprised" | "heart";

interface MascotButtonProps {
  onClick: () => void;
  unread?: number;
}

const SKIN = "#f4cdb1";
const SKIN_DARK = "#e4b090";

function EyeOverlay({ expression }: { expression: Expression }) {
  if (expression === "normal") return null;
  return (
    <svg
      viewBox="0 0 100 66"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      {expression === "blink" && (
        <>
          <ellipse cx="36" cy="28" rx="7" ry="4.5" fill={SKIN} />
          <ellipse cx="56" cy="28" rx="7" ry="4.5" fill={SKIN} />
          <path d="M29 28 Q36 31 43 28" stroke={SKIN_DARK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M49 28 Q56 31 63 28" stroke={SKIN_DARK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "wink" && (
        <>
          <ellipse cx="56" cy="28" rx="7" ry="4.5" fill={SKIN} />
          <path d="M49 28 Q56 31 63 28" stroke={SKIN_DARK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M30 26 Q36 24 42 26" stroke="#3a6ea5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "surprised" && (
        <>
          <ellipse cx="36" cy="27.5" rx="8.5" ry="7" fill="none" stroke="#3a6ea5" strokeWidth="1.8" />
          <ellipse cx="56" cy="27.5" rx="8.5" ry="7" fill="none" stroke="#3a6ea5" strokeWidth="1.8" />
          <ellipse cx="36" cy="27.5" rx="4" ry="4.5" fill="#3a6ea5" opacity="0.2" />
          <ellipse cx="56" cy="27.5" rx="4" ry="4.5" fill="#3a6ea5" opacity="0.2" />
        </>
      )}
      {expression === "heart" && (
        <>
          <text x="36" y="31" fontSize="10" textAnchor="middle" fill="#e05577">♥</text>
          <text x="56" y="31" fontSize="10" textAnchor="middle" fill="#e05577">♥</text>
        </>
      )}
    </svg>
  );
}

export default function MascotButton({ onClick, unread = 0 }: MascotButtonProps) {
  const BTN_W = 90;
  const BTN_H = 72;

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [expression, setExpression] = useState<Expression>("normal");
  const [isFloating, setIsFloating] = useState(true);
  const isDragging = useRef(false);
  const didMove = useRef(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });

  useEffect(() => {
    setPos({
      x: window.innerWidth - BTN_W - 20,
      y: window.innerHeight - BTN_H - 20,
    });
  }, []);

  const cycleExpression = useCallback(() => {
    const expressions: Expression[] = ["blink", "blink", "wink", "surprised", "heart", "blink"];
    const pick = expressions[Math.floor(Math.random() * expressions.length)];
    setExpression(pick);
    setTimeout(() => setExpression("normal"), 420);
  }, []);

  useEffect(() => {
    const base = 2600 + Math.random() * 1400;
    const id = setInterval(cycleExpression, base);
    return () => clearInterval(id);
  }, [cycleExpression]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    didMove.current = false;
    setIsFloating(false);
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      dx: e.clientX - rect.left,
      dy: e.clientY - rect.top,
    };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    didMove.current = true;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - BTN_W, e.clientX - dragOffset.current.dx)),
      y: Math.max(0, Math.min(window.innerHeight - BTN_H, e.clientY - dragOffset.current.dy)),
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
        width: BTN_W,
        height: BTN_H,
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: isDragging.current ? "grabbing" : "grab",
      }}
      animate={isFloating ? { y: [0, -7, 0] } : { y: 0 }}
      transition={isFloating ? { repeat: Infinity, duration: 2.6, ease: "easeInOut" } : undefined}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.94 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="relative w-full h-full" style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.25))" }}>
        <img
          src="/logo.png"
          alt="HanapCare"
          draggable={false}
          className="w-full h-full select-none"
          style={{ objectFit: "contain", imageRendering: "auto" }}
        />
        <AnimatePresence mode="wait">
          {expression !== "normal" && (
            <motion.div
              key={expression}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.05 }}
            >
              <EyeOverlay expression={expression} />
            </motion.div>
          )}
        </AnimatePresence>

        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md"
          >
            {unread > 99 ? "99+" : unread}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
