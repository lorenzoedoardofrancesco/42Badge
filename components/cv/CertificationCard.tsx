import { ThemeTokens } from "./Theme";

type CredlyBadge = {
  id: string;
  name?: string;
  imageUrl?: string;
  issuer?: string;
  label?: string;
};

export function CertificationCard({
  badge,
  accent,
  t,
}: {
  badge: CredlyBadge;
  accent: string;
  t: ThemeTokens;
}) {
  return (
    <a
      href={`https://www.credly.com/badges/${badge.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-3 p-5 rounded-xl border transition-colors hover:opacity-90 w-[160px] sm:w-[180px] no-underline group"
      style={{ borderColor: t.cardBorder, backgroundColor: t.cardBg, boxShadow: t.cardShadow, minHeight: "260px" }}
    >
      <div className="flex items-center justify-center w-28 h-28 shrink-0">
        {badge.imageUrl ? (
          <img src={badge.imageUrl} alt={badge.name ?? "Badge"} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}18` }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M8 14l-2 7 6-3 6 3-2-7"/></svg>
          </div>
        )}
      </div>
      <div className="flex-1 text-center min-w-0 w-full">
        <p className="text-xs font-semibold leading-snug" style={{ color: t.text, fontFamily: "'HelveticaNeue', sans-serif" }}>
          {badge.label || badge.name || "View Badge"}
        </p>
        {badge.issuer && (
          <p className="text-[10px] mt-0.5" style={{ color: t.textMuted }}>{badge.issuer}</p>
        )}
      </div>
      <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }}>
        Verify ↗
      </span>
    </a>
  );
}
