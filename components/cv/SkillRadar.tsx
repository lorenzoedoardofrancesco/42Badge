import React, { useState, useEffect } from "react";
import { Skill } from "./Types";
import { ThemeTokens } from "./Theme";

export function SkillRadar({
  skills,
  color,
  t,
}: {
  skills: Skill[];
  color: string;
  t: ThemeTokens;
}) {
  const [visible, setVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const radarSkills = skills.slice(0, 8);
  const n = radarSkills.length;
  if (n < 3) return null;

  const cx = 160, cy = 160, r = 90;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const point = (i: number, ratio: number) => ({
    x: cx + r * ratio * Math.cos(startAngle + i * angleStep),
    y: cy + r * ratio * Math.sin(startAngle + i * angleStep),
  });

  const guideLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = radarSkills.map((s, i) => point(i, s.level / 20));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <div>
      <svg viewBox="0 0 320 320" className="w-full max-w-[320px] mx-auto" style={{ overflow: "visible" }}>
        {guideLevels.map((level) => {
          const pts = radarSkills.map((_, i) => point(i, level));
          const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
          return (
            <path key={level} d={path} fill="none" stroke={t.cardBorder} strokeWidth={level === 1 ? 1 : 0.5} opacity={0.6} />
          );
        })}
        {radarSkills.map((_, i) => {
          const end = point(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={t.cardBorder} strokeWidth={0.5} opacity={0.4} />;
        })}
        <path
          d={dataPath}
          fill={`${color}18`}
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.3)",
            transformOrigin: `${cx}px ${cy}px`,
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
        {dataPoints.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={12} fill="transparent" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: "default" }} />
            <circle
              cx={p.x} cy={p.y}
              r={hoveredIndex === i ? 4 : 2.5}
              fill={color}
              style={{ opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${0.3 + i * 0.05}s, r 0.15s ease` }}
            />
          </g>
        ))}
        {radarSkills.map((s, i) => {
          const labelR = r + 22;
          const angle = startAngle + i * angleStep;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          const isLeft = Math.cos(angle) < -0.1;
          const isRight = Math.cos(angle) > 0.1;
          const isHovered = hoveredIndex === i;
          const words = s.name.split(/[\s&]+/);
          const short = words[0].length > 10 ? words[0].slice(0, 9) + "." : words.length > 1 && words[0].length + words[1].length < 14 ? words.slice(0, 2).join(" ") : words[0];
          return (
            <text
              key={s.name} x={lx} y={ly}
              textAnchor={isLeft ? "end" : isRight ? "start" : "middle"}
              dominantBaseline="central"
              fill={isHovered ? color : t.textSub}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ fontSize: "9.5px", fontFamily: "'HelveticaNeue', sans-serif", fontWeight: isHovered ? 500 : 400, cursor: "default", transition: "fill 0.15s ease, font-weight 0.15s ease" }}
            >
              {isHovered ? s.name : short}
            </text>
          );
        })}
      </svg>
      <div className="text-center mt-1" style={{ minHeight: "2em", opacity: hoveredIndex !== null ? 1 : 0, transition: "opacity 0.15s ease" }}>
        {hoveredIndex !== null && (
          <>
            <span className="text-sm font-medium" style={{ color: t.text, fontFamily: "'HelveticaNeue', sans-serif" }}>
              {radarSkills[hoveredIndex].name}
            </span>
            <span className="text-sm ml-2 tabular-nums" style={{ color, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 500 }}>
              {radarSkills[hoveredIndex].level.toFixed(2)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
