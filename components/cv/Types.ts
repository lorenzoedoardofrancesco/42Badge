import { WorkExperience } from "../../lib/workExperiences";

export type Skill = { name: string; level: number };

export type SkillTag = { category: string; items: string[] };

export type Project = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  finalMark: number | null;
  validated: boolean;
  cursusIds: number[];
  markedAt: string | null;
  teamId: number | null;
};

export type TeamStat = { totalEvals: number; outstandingCount: number };

export type Achievement = {
  id: number;
  name: string;
  description: string;
  tier: string;
  kind: string;
};

export type CursusEntry = {
  cursus: { id: number; name: string; slug: string };
  level: number;
  grade: string | null;
  begin_at: string;
  end_at: string | null;
  blackholed_at: string | null;
  skills: Skill[];
};

export type PublicProfile = {
  login: string;
  displayname: string | null;
  profileImage: string | null;
  email: string | null;
  campus: string;
  campusCountry: string | null;
  poolMonth: string;
  poolYear: string;
  cursusUsers: CursusEntry[];
  projects: Project[];
  achievements: Achievement[];
  githubUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  address: string | null;
  phone: string | null;
  bio: string | null;
  projectGithubLinks: Record<string, string>;
  projectDescriptionOverrides: Record<string, string>;
  workExperiences: WorkExperience[];
  credlyBadges: { id: string; name?: string; imageUrl?: string; issuer?: string; label?: string }[];
  featuredProjectIds: number[];
  skillTags: SkillTag[];
};

export type Rankings = {
  campusCohort?: { rank: number; total: number };
  cohort?: { rank: number; total: number };
  allTime?: { rank: number; total: number };
};
