import React, { useState, useEffect } from "react";
import { Skill } from "./Types";
import { ThemeTokens } from "./Theme";

export function SkillBar({
  skill,
  color,
  index,
  t,
}: {
  skill: Skill;
  color: string;
  index: number;
  t: ThemeTokens;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth((skill.level / 20) * 100), 80 + index * 45);
    return () => clearTimeout(timer);
  }, [skill.level, index]);

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[15px] font-semibold" style={{ color: t.text, fontFamily: "'HelveticaNeue', sans-serif", letterSpacing: "0.04em" }}>
          {skill.name}
        </span>
        <span className="text-sm tabular-nums" style={{ color, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 500 }}>
          {skill.level.toFixed(2)}
        </span>
      </div>
      <div className="h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: t.cardBorder }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 8px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}
