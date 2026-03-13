import { Project, TeamStat } from "./Types";
import { ThemeTokens, scoreTier } from "./Theme";
import { renderMd } from "../common/RenderMd";
import { GitHubIcon, IntraIcon } from "../common/Icons";

export function ProjectRow({
  project,
  accent,
  t,
  showOutstandingVotes,
  correctionNumber,
  teamStat,
  projectGithubLink,
  isViewer42,
  expandable,
  isExpanded,
  onToggle,
  description,
}: {
  project: Project;
  accent: string;
  t: ThemeTokens;
  showOutstandingVotes: boolean;
  correctionNumber: number | null;
  teamStat: TeamStat | null;
  projectGithubLink?: string;
  isViewer42: boolean;
  expandable: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  description: string | null | "loading";
}) {
  const tier = scoreTier(project.finalMark, project.validated);
  const tColors = t.tierColors[tier];
  const outstanding = teamStat?.outstandingCount ?? 0;

  return (
    <div className="print-project-row" style={expandable ? { borderColor: t.cardBorder } : undefined}>
      <div
        className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 ${expandable ? "cursor-pointer transition-colors select-none" : ""}`}
        onClick={expandable ? onToggle : undefined}
        style={{ backgroundColor: expandable && isExpanded ? `${accent}08` : "transparent" }}
      >
        <div className="shrink-0">
          <span
            className="text-sm sm:text-base rounded-lg border inline-flex items-center justify-center min-w-[48px] sm:min-w-[58px] h-8 sm:h-9"
            style={{ color: tColors.color, backgroundColor: tColors.bg, borderColor: tColors.border, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 700 }}
          >
            {project.finalMark ?? "-"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[13px] sm:text-[15px] uppercase tracking-wide truncate" style={{ color: t.text, fontFamily: "'HelveticaNeue', sans-serif", letterSpacing: "0.08em" }}>
              {project.name}
            </span>
            {project.markedAt && (
              <span className="hidden sm:inline text-xs shrink-0" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 300 }}>
                {new Date(project.markedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
          {project.markedAt && (
            <span className="sm:hidden text-[11px]" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 300 }}>
              {new Date(project.markedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>

        {showOutstandingVotes && correctionNumber != null && (
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: correctionNumber }).map((_, i) => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < outstanding ? "#eab308" : "none"} stroke={i < outstanding ? "#eab308" : t.textMuted} strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 no-print">
          {projectGithubLink && (
            <a
              href={projectGithubLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={expandable ? (e) => e.stopPropagation() : undefined}
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-colors shrink-0"
              style={{ borderColor: `${accent}40`, backgroundColor: `${accent}10` }}
              title="View on GitHub"
            >
              <GitHubIcon size={14} color={accent} />
            </a>
          )}
          {isViewer42 && (
            <a
              href={`https://projects.intra.42.fr/projects/${project.slug}/projects_users/${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={expandable ? (e) => e.stopPropagation() : undefined}
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-colors shrink-0"
              style={{ borderColor: `${accent}40`, backgroundColor: `${accent}10` }}
              title="View on 42 Intra"
            >
              <IntraIcon size={14} color={accent} />
            </a>
          )}
          {expandable && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: t.textMuted, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </div>

      {expandable ? (
        <div style={{ maxHeight: isExpanded ? "200px" : "0px", overflow: "hidden", transition: "max-height 0.28s ease" }}>
          <div className="px-3 sm:px-5 pb-4 pt-3" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
            {description === "loading" ? (
              <p className="text-xs italic" style={{ color: t.textMuted }}>Loading...</p>
            ) : description ? (
              <p className="text-[15px] leading-relaxed" style={{ color: t.textSub }}>{description}</p>
            ) : (
              <p className="text-sm italic" style={{ color: t.textMuted }}>No description available.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="px-3 sm:px-5 pb-4 pt-3" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
          {description === "loading" ? (
            <p className="text-xs italic" style={{ color: t.textMuted }}>Loading...</p>
          ) : description ? (
            <div className="text-[15px] leading-relaxed space-y-1.5" style={{ color: t.textSub }}>
              {description.split("\n").filter(Boolean).map((line, i) => (
                <p key={i}>{renderMd(line)}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm italic" style={{ color: t.textMuted }}>No description available.</p>
          )}
        </div>
      )}
    </div>
  );
}
