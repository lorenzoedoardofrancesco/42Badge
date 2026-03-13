import { Si42 } from "@icons-pack/react-simple-icons";
import { PublicProfile, Project, Skill, TeamStat } from "./Types";
import { ThemeTokens } from "./Theme";
import { FadeIn } from "../common/FadeIn";
import { SkillBar } from "./SkillBar";
import { SkillRadar } from "./SkillRadar";
import { AchievementList } from "./AchievementList";
import { Heatmap } from "./Heatmap";
import { ProjectRow } from "./ProjectRow";

export function CvJourney({
  profile,
  validatedProjects,
  skills,
  skillView,
  setSkillView,
  accent,
  t,
  showOutstandingVotes,
  correctionNumbers,
  teamStats,
  projectDescriptions,
  expandedProjectId,
  toggleProject,
  isViewer42,
}: {
  profile: PublicProfile;
  validatedProjects: Project[];
  skills: Skill[];
  skillView: "bars" | "radar";
  setSkillView: (v: "bars" | "radar") => void;
  accent: string;
  t: ThemeTokens;
  showOutstandingVotes: boolean;
  correctionNumbers: Record<string, number | null>;
  teamStats: Record<number, TeamStat>;
  projectDescriptions: Record<string, string | null | "loading">;
  expandedProjectId: number | null;
  toggleProject: (project: Project) => void;
  isViewer42: boolean;
}) {
  return (
    <div className="space-y-8">
      <Heatmap validatedProjects={validatedProjects} t={t} accent={accent} />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 print-single-col">
        <aside className="space-y-5 order-2 lg:order-1 print-order-1 print-mb lg:sticky lg:top-6 lg:self-start">
          {skills.length > 0 && (
            <FadeIn delay={200}>
              <div className="rounded-xl p-6 border" style={{ backgroundColor: t.cardBg, borderColor: t.cardBorder, boxShadow: t.cardShadow }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif" }}>
                    <Si42 size={11} color={t.textMuted} />
                    Skills
                  </h2>
                  {skills.length >= 3 && (
                    <button
                      onClick={() => setSkillView(skillView === "bars" ? "radar" : "bars")}
                      className="no-print flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] uppercase tracking-wider font-medium transition-colors"
                      style={{ borderColor: t.cardBorder, color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif" }}
                    >
                      {skillView === "bars" ? (
                        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><line x1="22" y1="8.5" x2="12" y2="15.5"/><line x1="2" y1="8.5" x2="12" y2="15.5"/></svg>Radar</>
                      ) : (
                        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Bars</>
                      )}
                    </button>
                  )}
                </div>
                {skillView === "bars" ? (
                  <div className="space-y-5">
                    {skills.map((skill, i) => (
                      <SkillBar key={skill.name} skill={skill} color={accent} index={i} t={t} />
                    ))}
                  </div>
                ) : (
                  <SkillRadar skills={skills} color={accent} t={t} />
                )}
              </div>
            </FadeIn>
          )}

          <AchievementList achievements={profile.achievements} accent={accent} t={t} />
        </aside>

        <section className="order-1 lg:order-2 print-order-2">
          <FadeIn delay={100}>
            <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: "'HelveticaNeue', sans-serif", color: t.text, letterSpacing: "0.02em" }}>
              Validated Projects
              <span className="ml-3 text-base font-normal" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 300 }}>
                {validatedProjects.length}
              </span>
            </h2>
          </FadeIn>

          {validatedProjects.length === 0 ? (
            <p className="text-sm" style={{ color: t.textMuted }}>No validated projects.</p>
          ) : (() => {
            const grouped: { year: string; projects: typeof validatedProjects }[] = [];
            let currentYear = "";
            for (const project of validatedProjects) {
              const year = project.markedAt ? new Date(project.markedAt).getFullYear().toString() : "Unknown";
              if (year !== currentYear) {
                currentYear = year;
                grouped.push({ year, projects: [] });
              }
              grouped[grouped.length - 1].projects.push(project);
            }

            return (
              <div className="space-y-6 print-year-gap">
                {grouped.map((group, gi) => (
                  <FadeIn key={group.year} delay={150 + gi * 80}>
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm font-bold tracking-wider" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif" }}>
                          {group.year}
                        </span>
                        <div className="flex-1 h-px" style={{ backgroundColor: t.hrColor }} />
                        <span className="text-[11px] tabular-nums" style={{ color: t.textMuted, fontFamily: "'HelveticaNeue', sans-serif", fontWeight: 300 }}>
                          {group.projects.length} project{group.projects.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: t.cardBorder, backgroundColor: t.cardBg, boxShadow: t.cardShadow }}>
                        {group.projects.map((project) => {
                          const stat = project.teamId ? teamStats[project.teamId] : null;
                          return (
                            <ProjectRow
                              key={project.id}
                              project={project}
                              accent={accent}
                              t={t}
                              showOutstandingVotes={showOutstandingVotes}
                              correctionNumber={correctionNumbers[project.slug] ?? null}
                              teamStat={stat}
                              projectGithubLink={profile.projectGithubLinks[project.slug]}
                              isViewer42={isViewer42}
                              expandable={true}
                              isExpanded={expandedProjectId === project.id}
                              onToggle={() => toggleProject(project)}
                              description={projectDescriptions[project.slug] ?? null}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
}
