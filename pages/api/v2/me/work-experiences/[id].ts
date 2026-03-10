import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import prisma from "../../../../../db";

class AuthError extends Error {
  constructor() {
    super();
    this.name = "AuthError";
    this.message = "Authentication failed";
  }
}

const PatchHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req });
  if (!token?.email) throw new AuthError();

  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { id: true },
  });
  if (!user) throw new AuthError();

  const { id } = req.query as { id: string };

  const existing = await prisma.workExperience.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return res.status(404).json({ error: "Not found" });
  }

  const {
    jobTitle,
    employmentType,
    companyName,
    companyCity,
    companyCountry,
    startDate,
    endDate,
    description,
    order,
  } = req.body as {
    jobTitle?: string;
    employmentType?: string;
    companyName?: string;
    companyCity?: string;
    companyCountry?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    order?: number;
  };

  const updated = await prisma.workExperience.update({
    where: { id },
    data: {
      ...(jobTitle !== undefined && { jobTitle: jobTitle || null }),
      ...(employmentType !== undefined && { employmentType }),
      ...(companyName !== undefined && { companyName: companyName || null }),
      ...(companyCity !== undefined && { companyCity: companyCity || null }),
      ...(companyCountry !== undefined && { companyCountry: companyCountry || null }),
      ...(startDate !== undefined && { startDate: startDate || null }),
      ...(endDate !== undefined && { endDate: endDate || null }),
      ...(description !== undefined && { description: description || null }),
      ...(order !== undefined && { order }),
    },
  });

  return res.status(200).json(updated);
};

const DeleteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req });
  if (!token?.email) throw new AuthError();

  const user = await prisma.user.findUnique({
    where: { email: token.email },
    select: { id: true },
  });
  if (!user) throw new AuthError();

  const { id } = req.query as { id: string };

  const existing = await prisma.workExperience.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return res.status(404).json({ error: "Not found" });
  }

  await prisma.workExperience.delete({ where: { id } });

  return res.status(200).json({ message: "deleted" });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "PATCH") return await PatchHandler(req, res);
    if (req.method === "DELETE") return await DeleteHandler(req, res);
    return res.status(405).json({ error: "method not allowed" });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({ message: error.message });
    }
    console.error(error);
    throw error;
  }
}
