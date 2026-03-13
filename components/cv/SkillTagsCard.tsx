import { SkillTag } from "./Types";
import { ThemeTokens } from "./Theme";
import { FadeIn } from "../common/FadeIn";
import { SKILL_PALETTE } from "../../lib/skillPalette";

export function SkillTagsCard({
  skillTags,
  t,
  delay = 200,
}: {
  skillTags: SkillTag[];
  t: ThemeTokens;
  delay?: number;
}) {
  if (skillTags.length === 0) return null;

  return (
    <FadeIn delay={delay}>
      <div className="rounded-xl p-6 border" style={{ backgroundColor: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif" }}>
          Skills
        </h2>
        <div className="space-y-4">
          {skillTags.map((tag, i) => {
            const c = SKILL_PALETTE[i % SKILL_PALETTE.length];
            return (
              <div key={tag.category}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: c.text, fontFamily: "'HelveticaNeue', sans-serif" }}>
                  {tag.category}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tag.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                      style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text, fontFamily: "'HelveticaNeue', sans-serif" }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
