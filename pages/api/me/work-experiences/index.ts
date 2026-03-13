import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import prisma from "../../../../db";
import { EMPLOYMENT_TYPES } from "../../../../lib/workExperiences";

const VALID_EMPLOYMENT_VALUES = new Set<string>(EMPLOYMENT_TYPES.map(t => t.value));

class AuthError extends Error {
  constructor() {
    super();
    this.name = "AuthError";
    this.message = "Authentication failed";
  }
}

const GetHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req });
  if (!token?.email) throw new AuthError();

  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { id: true },
  });
  if (!user) throw new AuthError();

  const experiences = await prisma.workExperience.findMany({
    where: { userId: user.id },
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });

  return res.status(200).json(experiences);
};

const PostHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req });
  if (!token?.email) throw new AuthError();

  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { id: true, extended42Data: true },
  });
  if (!user) throw new AuthError();

  const {
    type,
    projectSlug,
    jobTitle,
    employmentType,
    companyName,
    companyCity,
    companyCountry,
    startDate,
    endDate,
    description,
  } = req.body as {
    type?: string;
    projectSlug?: string;
    jobTitle?: string;
    employmentType?: string;
    companyName?: string;
    companyCity?: string;
    companyCountry?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  };

  if (!type || !employmentType) {
    return res.status(400).json({ error: "type and employmentType are required" });
  }

  if (type !== "FORTY_TWO" && type !== "EXTERNAL") {
    return res.status(400).json({ error: "type must be FORTY_TWO or EXTERNAL" });
  }
  if (!VALID_EMPLOYMENT_VALUES.has(employmentType)) {
    return res.status(400).json({ error: "invalid employmentType" });
  }

  // Field length validation
  if (jobTitle && jobTitle.length > 200) return res.status(400).json({ error: "jobTitle too long (max 200)" });
  if (companyName && companyName.length > 200) return res.status(400).json({ error: "companyName too long (max 200)" });
  if (companyCity && companyCity.length > 100) return res.status(400).json({ error: "companyCity too long (max 100)" });
  if (companyCountry && companyCountry.length > 100) return res.status(400).json({ error: "companyCountry too long (max 100)" });
  if (description && description.length > 2000) return res.status(400).json({ error: "description too long (max 2000)" });
  if (startDate && !/^\d{4}-\d{2}(-\d{2})?$/.test(startDate)) return res.status(400).json({ error: "invalid startDate format" });
  if (endDate && !/^\d{4}-\d{2}(-\d{2})?$/.test(endDate)) return res.status(400).json({ error: "invalid endDate format" });

  let finalScore: number | null = null;

  if (type === "FORTY_TWO") {
    if (!projectSlug) {
      return res.status(400).json({ error: "projectSlug is required for FORTY_TWO type" });
    }

    const data = user.extended42Data as any;
    const projectsUsers: any[] = data?.projects_users ?? [];
    const projectUser = projectsUsers.find(
      (p: any) => p.project?.slug === projectSlug
    );

    if (!projectUser) {
      return res.status(400).json({ error: "Project not found in your 42 data" });
    }

    if (!projectUser["validated?"] || !projectUser.final_mark || projectUser.final_mark <= 0) {
      return res.status(400).json({ error: "Project must be validated with a positive final mark" });
    }

    finalScore = projectUser.final_mark;
  }

  const experience = await prisma.workExperience.create({
    data: {
      userId: user.id,
      type,
      projectSlug: type === "FORTY_TWO" ? (projectSlug ?? null) : null,
      finalScore,
      jobTitle: jobTitle ?? null,
      employmentType,
      companyName: companyName ?? null,
      companyCity: companyCity ?? null,
      companyCountry: companyCountry ?? null,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      description: description ?? null,
    },
  });

  return res.status(201).json(experience);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") return await GetHandler(req, res);
    if (req.method === "POST") return await PostHandler(req, res);
    return res.status(405).json({ error: "method not allowed" });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({ message: error.message });
    }
    console.error(error);
    throw error;
  }
}
