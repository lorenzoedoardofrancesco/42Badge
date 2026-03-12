// Known 42 work-experience project slugs. Varies by campus - this list covers
// the common ones; new slugs can be added here as needed.
export const WORK_EXP_SLUGS = new Set([
  "work-experience-i",
  "work-experience-ii",
  "part-time-i",
  "part-time-ii",
  "fr-alternance-rncp6-1-an",
  "fr-alternance-rncp6-2-ans",
  "fr-alternance-rncp7-1-an",
  "fr-alternance-rncp7-2-ans",
  "startup-internship",
  "startup-experience",
  "contrat-de-premier-stage",
  "contrat-alternance",
  "internship",
  "part-time",
  "work-experience",
]);

export const EMPLOYMENT_TYPES = [
  { value: "internship",     label: "Internship" },
  { value: "part_time",      label: "Part-time" },
  { value: "full_time",      label: "Full-time" },
  { value: "apprenticeship", label: "Apprenticeship" },
  { value: "work_study",     label: "Work-study" },
  { value: "freelance",      label: "Freelance" },
] as const;

export function getEmploymentLabel(value: string): string {
  return EMPLOYMENT_TYPES.find(t => t.value === value)?.label ?? value;
}

export type WorkExperience = {
  id: string;
  type: "FORTY_TWO" | "EXTERNAL";
  projectSlug: string | null;
  finalScore: number | null;
  jobTitle: string | null;
  employmentType: string;
  companyName: string | null;
  companyCity: string | null;
  companyCountry: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  order: number;
};

export function isDisplayable(exp: WorkExperience): boolean {
  return !!(exp.companyName?.trim() && exp.description?.trim() && exp.startDate?.trim());
}

export function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate) return "";
  const fmt = (d: string) => {
    const [year, month] = d.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en", { month: "short", year: "numeric" });
  };
  return `${fmt(startDate)} - ${endDate ? fmt(endDate) : "Present"}`;
}
