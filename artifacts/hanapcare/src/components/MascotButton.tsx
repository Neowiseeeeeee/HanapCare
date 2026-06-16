import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface MascotButtonProps {
  onClick: () => void;
  unread?: number;
}

export default function MascotButton({ onClick, unread = 0 }: MascotButtonProps) {
  const SIZE = 68;

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isFloating, setIsFloating] = useState(true);
  const isDragging = useRef(false);
  const didMove = useRef(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });

  useEffect(() => {
    setPos({
      x: window.innerWidth - SIZE - 20,
      y: window.innerHeight - SIZE - 20,
    });
  }, []);

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
      <div
        className="relative w-full h-full"
        style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.28))" }}
      >
        <img
          src="/logo.png"
          alt="HanapCare"
          draggable={false}
          className="w-full h-full select-none"
          style={{ objectFit: "contain" }}
        />

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
