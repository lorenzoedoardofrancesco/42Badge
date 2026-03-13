import React, { useState } from "react";
import { Si42 } from "@icons-pack/react-simple-icons";
import { Project } from "./Types";
import { ThemeTokens } from "./Theme";
import { FadeIn } from "../common/FadeIn";

type DayData = { count: number; names: string[] };

export function Heatmap({
  validatedProjects,
  t,
  accent,
}: {
  validatedProjects: Project[];
  t: ThemeTokens;
  accent: string;
}) {
  const [cellTooltip, setCellTooltip] = useState<{ date: string; names: string[]; x: number; y: number } | null>(null);
  const [heatmapYearIdx, setHeatmapYearIdx] = useState(0);

  const fmtKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const dayMap: Record<string, DayData> = {};
  for (const p of validatedProjects) {
    if (!p.markedAt) continue;
    const key = fmtKey(new Date(p.markedAt));
    if (!dayMap[key]) dayMap[key] = { count: 0, names: [] };
    dayMap[key].count++;
    dayMap[key].names.push(p.name);
  }

  const today = new Date(); today.setHours(0,0,0,0);
  const maxCount = Math.max(...Object.values(dayMap).map(d => d.count), 1);
  const getColor = (count: number) => {
    if (count === 0) return t.hrColor;
    const i = Math.min(count / maxCount, 1);
    if (i < 0.25) return `${accent}55`;
    if (i < 0.5)  return `${accent}88`;
    if (i < 0.75) return `${accent}bb`;
    return accent;
  };

  const years = [...new Set(validatedProjects.filter(p => p.markedAt).map(p => new Date(p.markedAt!).getFullYear()))].sort((a,b) => b-a);
  if (years.length === 0) return null;

  const buildYearGrid = (year: number) => {
    const jan1 = new Date(year, 0, 1);
    const offset = jan1.getDay();
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInYear = isLeap ? 366 : 365;
    const weeks: ({ date: Date; key: string; data: DayData | null } | null)[][] = [];
    let week: ({ date: Date; key: string; data: DayData | null } | null)[] = [];
    for (let i = 0; i < offset; i++) week.push(null);
    for (let d = 0; d < daysInYear; d++) {
      const date = new Date(year, 0, d + 1);
      const key = fmtKey(date);
      week.push({ date, key, data: dayMap[key] ?? null });
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

    const monthCols: { month: string; wi: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((w, wi) => {
      const firstReal = w.find(c => c !== null);
      if (firstReal) {
        const m = firstReal.date.getMonth();
        if (m !== lastMonth) { monthCols.push({ month: firstReal.date.toLocaleDateString("en", { month: "short" }), wi }); lastMonth = m; }
      }
    });

    const yearTotal = Object.entries(dayMap).filter(([k]) => k.startsWith(`${year}-`)).reduce((s,[,v]) => s + v.count, 0);
    return { weeks, monthCols, yearTotal };
  };

  const yearIdx = Math.min(heatmapYearIdx, years.length - 1);
  const year = years[yearIdx];
  const { weeks, monthCols, yearTotal } = buildYearGrid(year);

  return (
    <>
      <FadeIn delay={80}>
        <div
          className="rounded-xl border p-5 sm:p-6"
          style={{ backgroundColor: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}
          onTouchStart={(e) => { const x = e.touches[0].clientX; (e.currentTarget as any)._touchX = x; }}
          onTouchEnd={(e) => {
            const startX = (e.currentTarget as any)._touchX;
            if (startX == null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) < 40) return;
            if (dx < 0 && yearIdx < years.length - 1) setHeatmapYearIdx(yearIdx + 1);
            if (dx > 0 && yearIdx > 0) setHeatmapYearIdx(yearIdx - 1);
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif" }}>
                <Si42 size={11} color={t.textMuted} /> Project Activity
              </h2>
              <span className="text-xs" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif" }}>
                <span className="font-semibold" style={{ color: t.textSub }}>{yearTotal}</span> project{yearTotal !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHeatmapYearIdx(i => Math.min(i + 1, years.length - 1))}
                disabled={yearIdx >= years.length - 1}
                className="w-6 h-6 flex items-center justify-center rounded transition-colors disabled:opacity-30"
                style={{ color: t.textMuted }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span className="text-sm font-bold tabular-nums" style={{ color: t.textSub, fontFamily: "'HelveticaNeue', sans-serif", minWidth: 36, textAlign: "center" }}>{year}</span>
              <button
                onClick={() => setHeatmapYearIdx(i => Math.max(i - 1, 0))}
                disabled={yearIdx <= 0}
                className="w-6 h-6 flex items-center justify-center rounded transition-colors disabled:opacity-30"
                style={{ color: t.textMuted }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto no-scrollbar flex justify-center">
            <div style={{ minWidth: "max-content" }}>
              <div className="flex gap-[3px] mb-1">
                {weeks.map((_, wi) => {
                  const mc = monthCols.find(m => m.wi === wi);
                  return (
                    <div key={wi} style={{ width: 11, minWidth: 11 }}>
                      {mc && <span className="text-[9px]" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif", whiteSpace: "nowrap" }}>{mc.month}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-[3px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((cell, di) => (
                      <div
                        key={di}
                        onMouseEnter={cell?.data ? (e) => {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setCellTooltip({ date: cell.key, names: cell.data!.names, x: rect.left + rect.width / 2, y: rect.top });
                        } : undefined}
                        onMouseLeave={cell?.data ? () => setCellTooltip(null) : undefined}
                        style={{
                          width: 11, height: 11, borderRadius: 2, flexShrink: 0,
                          backgroundColor: cell ? getColor(cell.data?.count ?? 0) : "transparent",
                          opacity: cell && cell.date > today ? 0.25 : 1,
                          cursor: cell?.data ? "pointer" : "default",
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {cellTooltip && (
        <div
          className="no-print"
          onMouseLeave={() => setCellTooltip(null)}
          style={{
            position: "fixed",
            left: cellTooltip.x,
            top: cellTooltip.y - 8,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
            backgroundColor: "#1f2328",
            color: "#e6edf3",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            borderRadius: 8,
            padding: "8px 12px",
            maxWidth: 220,
            pointerEvents: "none",
          }}
        >
          <p className="text-[10px] font-semibold mb-1.5" style={{ color: "#8b949e", fontFamily: "'HelveticaNeue', sans-serif" }}>{cellTooltip.date}</p>
          {cellTooltip.names.map((name, i) => (
            <p key={i} className="text-xs" style={{ fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 500, color: "#e6edf3" }}>{name}</p>
          ))}
        </div>
      )}
    </>
  );
}
