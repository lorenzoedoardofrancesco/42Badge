import { ThemeTokens } from "./Theme";

export function StatPill({
  label,
  shortLabel,
  value,
  sub,
  accent,
  t,
  tooltip,
}: {
  label: string;
  shortLabel?: string;
  value: string;
  sub: string;
  accent: string;
  t: ThemeTokens;
  tooltip?: string;
}) {
  return (
    <div
      className={`relative min-w-0 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border overflow-visible ${tooltip ? "group cursor-help" : ""}`}
      style={{ backgroundColor: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}
    >
      <div
        className="text-[9px] sm:text-xs uppercase tracking-wide sm:tracking-widest mb-1 truncate"
        style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif" }}
      >
        <span className="sm:hidden">{shortLabel ?? label}</span>
        <span className="hidden sm:inline">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-base sm:text-2xl font-bold leading-none" style={{ color: accent, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 700 }}>
          {value}
        </span>
        <span className="text-[10px] sm:text-sm" style={{ color: t.textMuted }}>
          {sub}
        </span>
      </div>
      {tooltip && (
        <span
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 px-3 py-2 rounded-lg text-xs leading-snug pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-center z-20"
          style={{ backgroundColor: "#1f2328", color: "#e6edf3", boxShadow: "0 4px 16px rgba(0,0,0,0.3)", fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 300 }}
        >
          {tooltip}
          <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1f2328" }} />
        </span>
      )}
    </div>
  );
}
