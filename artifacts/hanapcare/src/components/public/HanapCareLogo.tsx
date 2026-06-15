interface HanapCareLogoProps {
  size?: number;
  className?: string;
}

export function HanapCareLogoIcon({ size = 36, className = "" }: HanapCareLogoProps) {
  return (
    <img
      src="/hanapcare-icon-nobg.png"
      alt="HanapCare"
      width={size}
      height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

interface HanapCareWordmarkProps {
  size?: number;
  dark?: boolean;
  className?: string;
}

export function HanapCareWordmark({ size = 36, dark = false, className = "" }: HanapCareWordmarkProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <HanapCareLogoIcon size={size} />
      <span
        className="font-bold tracking-tight"
        style={{ fontSize: size * 0.56, color: dark ? "#0f172a" : "white" }}
      >
        Hanap<span style={{ color: "#38bdf8" }}>Care</span>
      </span>
    </div>
  );
}
