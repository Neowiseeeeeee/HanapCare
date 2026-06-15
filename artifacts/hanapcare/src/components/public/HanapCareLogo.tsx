interface HanapCareLogoProps {
  size?: number;
  className?: string;
}

export function HanapCareLogoIcon({ size = 36, className = "" }: HanapCareLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="hc-bg" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect width="180" height="180" rx="40" fill="url(#hc-bg)" />
      <path d="M 80 63 C 80 46 58 33 47 31" stroke="white" strokeWidth="7.5" strokeLinecap="round" fill="none" />
      <path d="M 80 63 C 80 46 102 33 113 31" stroke="white" strokeWidth="7.5" strokeLinecap="round" fill="none" />
      <circle cx="47" cy="31" r="9.5" fill="white" />
      <circle cx="113" cy="31" r="9.5" fill="white" />
      <circle cx="80" cy="100" r="37" stroke="white" strokeWidth="9" fill="none" />
      <circle cx="80" cy="100" r="21" stroke="white" strokeWidth="3.5" fill="white" fillOpacity="0.18" />
      <line x1="107" y1="127" x2="152" y2="163" stroke="white" strokeWidth="14" strokeLinecap="round" />
    </svg>
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
