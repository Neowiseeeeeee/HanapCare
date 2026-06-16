import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Expression = "normal" | "blink" | "wink" | "surprised" | "heart";

interface MascotButtonProps {
  onClick: () => void;
  unread?: number;
}

const SKIN = "#f4cdb1";
const SKIN_DARK = "#e8b898";

function EyeOverlay({ expression }: { expression: Expression }) {
  return (
    <svg
      viewBox="0 0 100 66"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: "visible" }}
    >
      {expression === "blink" && (
        <>
          <ellipse cx="37.5" cy="42" rx="7" ry="5.5" fill={SKIN} />
          <ellipse cx="57" cy="42" rx="7" ry="5.5" fill={SKIN} />
          <path d="M30.5 42 Q37.5 45 44.5 42" stroke={SKIN_DARK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M50 42 Q57 45 64 42" stroke={SKIN_DARK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "wink" && (
        <>
          <ellipse cx="57" cy="42" rx="7" ry="5.5" fill={SKIN} />
          <path d="M50 42 Q57 45 64 42" stroke={SKIN_DARK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "surprised" && (
        <>
          <ellipse cx="37.5" cy="41.5" rx="8" ry="7" fill="none" stroke="#3a6ea5" strokeWidth="1.5" />
          <ellipse cx="57" cy="41.5" rx="8" ry="7" fill="none" stroke="#3a6ea5" strokeWidth="1.5" />
          <ellipse cx="37.5" cy="41.5" rx="4" ry="5" fill="#3a6ea5" opacity="0.15" />
          <ellipse cx="57" cy="41.5" rx="4" ry="5" fill="#3a6ea5" opacity="0.15" />
        </>
      )}
      {expression === "heart" && (
        <>
          <text x="30" y="46" fontSize="10" textAnchor="middle" fill="#e05577">♥</text>
          <text x="50" y="46" fontSize="10" textAnchor="middle" fill="#e05577">♥</text>
        </>
      )}
    </svg>
  );
}

export default function MascotButton({ onClick, unread = 0 }: MascotButtonProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [expression, setExpression] = useState<Expression>("normal");
  const [isFloating, setIsFloating] = useState(true);
  const isDragging = useRef(false);
  const didMove = useRef(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPos({
      x: window.innerWidth - 80,
      y: window.innerHeight - 88,
    });
  }, []);

  const cycleExpression = useCallback(() => {
    const roll = Math.random();
    if (roll < 0.35) setExpression("blink");
    else if (roll < 0.55) setExpression("wink");
    else if (roll < 0.7) setExpression("surprised");
    else if (roll < 0.8) setExpression("heart");
    else setExpression("normal");

    setTimeout(() => setExpression("normal"), 420);
  }, []);

  useEffect(() => {
    const id = setInterval(cycleExpression, 2800 + Math.random() * 1500);
    return () => clearInterval(id);
  }, [cycleExpression]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      isDragging.current = true;
      didMove.current = false;
      setIsFloating(false);
      const rect = e.currentTarget.getBoundingClientRect();
      dragOffset.current = {
        dx: e.clientX - rect.left,
        dy: e.clientY - rect.top,
      };
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDragging.current) return;
      didMove.current = true;
      const newX = e.clientX - dragOffset.current.dx;
      const newY = e.clientY - dragOffset.current.dy;
      const clamped = {
        x: Math.max(0, Math.min(window.innerWidth - 64, newX)),
        y: Math.max(0, Math.min(window.innerHeight - 64, newY)),
      };
      setPos(clamped);
    },
    []
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      isDragging.current = false;
      setIsFloating(true);
      if (!didMove.current) {
        onClick();
      }
    },
    [onClick]
  );

  if (!pos) return null;

  return (
    <motion.button
      ref={btnRef}
      aria-label="Open chat support"
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        touchAction: "none",
        userSelect: "none",
        zIndex: 50,
        width: 64,
        height: 64,
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: isDragging.current ? "grabbing" : "grab",
      }}
      animate={
        isFloating
          ? { y: [0, -6, 0], transition: { repeat: Infinity, duration: 2.4, ease: "easeInOut" } }
          : { y: 0 }
      }
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="relative w-full h-full drop-shadow-xl">
        <img
          src="/logo.png"
          alt="HanapCare"
          draggable={false}
          className="w-full h-full object-contain select-none"
          style={{ imageRendering: "crisp-edges" }}
        />
        <AnimatePresence mode="wait">
          {expression !== "normal" && (
            <motion.div
              key={expression}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.06 }}
            >
              <EyeOverlay expression={expression} />
            </motion.div>
          )}
        </AnimatePresence>

        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[1.2rem] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
          >
            {unread > 99 ? "99+" : unread}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
