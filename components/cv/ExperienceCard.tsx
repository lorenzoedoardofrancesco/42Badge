import { Si42 } from "@icons-pack/react-simple-icons";
import { WorkExperience, formatDateRange, getEmploymentLabel } from "../../lib/workExperiences";
import { ThemeTokens } from "./Theme";
import { renderMd } from "../common/RenderMd";

export function ExperienceCard({
  exp,
  t,
}: {
  exp: WorkExperience;
  t: ThemeTokens;
}) {
  return (
    <div
      className="rounded-xl border print-break-inside-avoid overflow-hidden"
      style={{ backgroundColor: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-tight" style={{ color: t.text, fontFamily: "'HelveticaNeue', sans-serif" }}>
            {exp.companyName}
          </p>
          {(exp.companyCity || exp.companyCountry) && (
            <p className="text-[12px] mt-0.5" style={{ color: t.textSub, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 300 }}>
              {[exp.companyCity, exp.companyCountry].filter(Boolean).join(", ")}
            </p>
          )}
          {exp.jobTitle && (
            <p className="text-[13px] font-semibold mt-1" style={{ color: t.text, fontFamily: "'HelveticaNeue', sans-serif" }}>
              {exp.jobTitle}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[12px]" style={{ color: t.textSub, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 300 }}>
            {formatDateRange(exp.startDate, exp.endDate)}
          </p>
          <span
            className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border mt-1.5"
            style={{ color: t.textSub, borderColor: t.cardBorder, backgroundColor: "transparent", fontFamily: "'HelveticaNeue', sans-serif" }}
          >
            {getEmploymentLabel(exp.employmentType).toUpperCase()}
          </span>
        </div>
      </div>

      {exp.description && (
        <>
          <hr style={{ borderColor: t.cardBorder }} />
          <div className="px-5 py-3 space-y-1.5">
            {exp.description.split("\n").filter(Boolean).map((line, j) => (
              <p key={j} className="text-[13px] leading-relaxed" style={{ color: t.textSub, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 300 }}>
                {renderMd(line)}
              </p>
            ))}
          </div>
        </>
      )}

      {exp.type === "FORTY_TWO" && (
        <div className="flex items-center gap-2 px-5 pb-4 pt-1">
          {exp.finalScore !== null && (
            <span
              className="text-sm font-bold px-2.5 py-0.5 rounded-lg border"
              style={{ color: "#22c55e", backgroundColor: "rgba(34,197,94,0.10)", borderColor: "rgba(34,197,94,0.30)", fontFamily: "'HelveticaNeue', sans-serif" }}
            >
              {exp.finalScore}
            </span>
          )}
          <span className="relative group flex items-center gap-1.5 cursor-help">
            <Si42 size={16} style={{ color: t.textSub }} />
            <span className="text-[12px]" style={{ color: t.textSub, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 400 }}>
              Certified by 42
            </span>
            <span
              className="absolute left-0 bottom-full mb-2 w-56 px-3 py-2 rounded-lg text-xs leading-snug pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20"
              style={{ backgroundColor: "#1f2328", color: "#e6edf3", boxShadow: "0 4px 16px rgba(0,0,0,0.3)", fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 300 }}
            >
              This experience was validated and scored through the official École 42 internship program.
              <span className="absolute left-4 top-full w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1f2328" }} />
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
