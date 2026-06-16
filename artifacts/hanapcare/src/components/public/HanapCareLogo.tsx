interface HanapCareLogoProps {
  size?: number;
  className?: string;
}

export function HanapCareLogoIcon({ size = 48, className = "" }: HanapCareLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="HanapCare"
      draggable={false}
      className={`object-contain flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: "auto", minHeight: Math.round(size * 0.65) }}
    />
  );
}

interface HanapCareWordmarkProps {
  size?: number;
  dark?: boolean;
  className?: string;
}

export function HanapCareWordmark({ size = 48, dark = false, className = "" }: HanapCareWordmarkProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <HanapCareLogoIcon size={size} />
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: size * 0.5, color: dark ? "#0f172a" : "white" }}
      >
        Hanap<span style={{ color: "#38bdf8" }}>Care</span>
      </span>
    </div>
  );
}
