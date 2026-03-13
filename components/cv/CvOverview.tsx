import { PublicProfile, Project, TeamStat, Skill } from "./Types";
import { ThemeTokens } from "./Theme";
import { FadeIn } from "../common/FadeIn";
import { SkillTagsCard } from "./SkillTagsCard";
import { AchievementList } from "./AchievementList";
import { ExperienceCard } from "./ExperienceCard";
import { CertificationCard } from "./CertificationCard";
import { ProjectRow } from "./ProjectRow";

export function CvOverview({
  profile,
  featuredProjects,
  accent,
  t,
  showOutstandingVotes,
  correctionNumbers,
  teamStats,
  projectDescriptions,
  isViewer42,
}: {
  profile: PublicProfile;
  featuredProjects: Project[];
  accent: string;
  t: ThemeTokens;
  showOutstandingVotes: boolean;
  correctionNumbers: Record<string, number | null>;
  teamStats: Record<number, TeamStat>;
  projectDescriptions: Record<string, string | null | "loading">;
  isViewer42: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 print-single-col">
      <aside className="space-y-5 order-2 lg:order-1 print-order-1 print-mb lg:sticky lg:top-6 lg:self-start">
        <SkillTagsCard skillTags={profile.skillTags} t={t} />
        <AchievementList achievements={profile.achievements} accent={accent} t={t} />
      </aside>

      <section className="order-1 lg:order-2 print-order-2 space-y-10">
        {profile.workExperiences.length > 0 && (
          <div>
            <FadeIn delay={100}>
              <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: "'HelveticaNeue', sans-serif", color: t.text, letterSpacing: "0.02em" }}>
                Professional Experience
              </h2>
            </FadeIn>
            <div className="space-y-5">
              {profile.workExperiences.map((exp, i) => (
                <FadeIn key={exp.id} delay={100 + i * 60}>
                  <ExperienceCard exp={exp} t={t} />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {profile.credlyBadges.length > 0 && (
          <div>
            <FadeIn delay={160}>
              <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: "'HelveticaNeue', sans-serif", color: t.text, letterSpacing: "0.02em" }}>
                Certifications
              </h2>
            </FadeIn>
            <div className="flex flex-wrap gap-4">
              {profile.credlyBadges.map((badge, i) => (
                <FadeIn key={badge.id} delay={160 + i * 60}>
                  <CertificationCard badge={badge} accent={accent} t={t} />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {featuredProjects.length > 0 && (
          <div>
            <FadeIn delay={200}>
              <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: "'HelveticaNeue', sans-serif", color: t.text, letterSpacing: "0.02em" }}>
                Selected École 42 Projects
              </h2>
            </FadeIn>
            <div className="space-y-4">
              {featuredProjects.map((project, i) => {
                const desc = profile.projectDescriptionOverrides[project.slug] || projectDescriptions[project.slug];
                const stat = project.teamId ? teamStats[project.teamId] : null;
                return (
                  <FadeIn key={project.id} delay={100 + i * 60}>
                    <div className="rounded-xl border overflow-hidden print-project-row" style={{ borderColor: t.cardBorder, backgroundColor: t.cardBg, boxShadow: t.cardShadow }}>
                      <ProjectRow
                        project={project}
                        accent={accent}
                        t={t}
                        showOutstandingVotes={showOutstandingVotes}
                        correctionNumber={correctionNumbers[project.slug] ?? null}
                        teamStat={stat}
                        projectGithubLink={profile.projectGithubLinks[project.slug]}
                        isViewer42={isViewer42}
                        expandable={false}
                        description={desc ?? null}
                      />
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
