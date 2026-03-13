import { Si42 } from "@icons-pack/react-simple-icons";
import { Achievement } from "./Types";
import { ThemeTokens } from "./Theme";
import { FadeIn } from "../common/FadeIn";

function tierColor(tier: string, accent: string): string {
  if (tier === "challenge") return "#a855f7";
  if (tier === "hard") return "#f97316";
  if (tier === "medium") return "#3b82f6";
  if (tier === "easy") return "#22c55e";
  return accent;
}

export function AchievementList({
  achievements,
  accent,
  t,
  delay = 350,
}: {
  achievements: Achievement[];
  accent: string;
  t: ThemeTokens;
  delay?: number;
}) {
  if (achievements.length === 0) return null;

  return (
    <FadeIn delay={delay}>
      <div className="rounded-xl p-6 border print-break-inside-avoid" style={{ backgroundColor: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-1.5" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif" }}>
          <Si42 size={11} color={t.textMuted} />
          Achievements
        </h2>
        <div className="space-y-3">
          {achievements.map((a) => {
            const tc = tierColor(a.tier, accent);
            return (
              <div key={a.id} className="pl-3 py-0.5" style={{ borderLeft: `2px solid ${tc}` }}>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] leading-tight" style={{ color: t.text, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 500 }}>
                    {a.name}
                  </p>
                  {a.tier && a.tier !== "none" && (
                    <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ color: tc, backgroundColor: `${tc}18`, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 500 }}>
                      {a.tier}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-snug" style={{ color: t.textSub, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 300 }}>
                  {a.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
