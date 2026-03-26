import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import fs from "fs";
import path from "path";
import prisma from "../../db";
import {
  updateUserExtends42Data,
  UserNotFound,
} from "../../lib/updateUserExtends42Data";

class AuthError extends Error {
  constructor() {
    super();
    this.name = "AuthError";
    this.message = "Authentication failed";
  }
}

const GetHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = await getToken({ req });
    if (!token) throw new AuthError();

    const user = await updateUserExtends42Data({
      email: token.email,
    });

    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof AuthError || error instanceof UserNotFound) {
      return res.status(401).json({
        error: error.message,
      });
    }
    console.error(error);
    throw error;
  }
};

const DeleteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = await getToken({ req });
    if (!token) throw new AuthError();

    const user = await prisma.user.findUnique({
      where: { email: token.email! },
      select: { id: true, customPhotoUrl: true, extended42Data: true } as any,
    });

    // Delete local photo file
    if (user?.customPhotoUrl) {
      for (const ext of ["jpg", "png"]) {
        const photoPath = path.join("/data/cv_photos", `${user.id}.${ext}`);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      }
    }

    // Delete cached OG image
    const login = (user as any)?.extended42Data?.login;
    if (login) {
      const ogPath = path.join("/tmp/og_cache", `${login}.png`);
      if (fs.existsSync(ogPath)) fs.unlinkSync(ogPath);
    }

    await prisma.user.delete({ where: { email: token.email } });

    return res.status(200).json({ message: "success" });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({
        error: error.message,
      });
    }
    console.error(error);
    throw error;
  }
};

class ValidateError extends Error {
  constructor(fields: string[]) {
    super();
    this.name = "ValidateError";
    this.message = `Body failed validation required [${fields.join(", ")}]`;
  }
}

const PatchHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { isDisplayEmail, isDisplayName, isDisplayPhoto, isDisplayProjectCount, isPublicProfile, isDisplayOutstandingVotes, selectedAchievementIds, githubUrl, linkedinUrl, websiteUrl, address, phone, defaultDarkMode, isDisplayCampusCohortRank, isDisplayCohortRank, isDisplayAllTimeRank, isDisplayJourney, bio, featuredProjectIds, skillTags, projectDescriptionOverrides, credlyBadges, photoMode } = req.body as {
      isDisplayEmail?: string;
      isDisplayName?: string;
      isDisplayPhoto?: string;
      isDisplayProjectCount?: string;
      photoMode?: string;
      isPublicProfile?: string;
      isDisplayOutstandingVotes?: string;
      selectedAchievementIds?: number[];
      githubUrl?: string;
      linkedinUrl?: string;
      websiteUrl?: string;
      address?: string;
      phone?: string;
      defaultDarkMode?: string;
      isDisplayCampusCohortRank?: string;
      isDisplayCohortRank?: string;
      isDisplayAllTimeRank?: string;
      isDisplayJourney?: string;
      bio?: string;
      featuredProjectIds?: number[];
      skillTags?: { category: string; items: string[] }[];
      projectDescriptionOverrides?: Record<string, string>;
      credlyBadges?: { id: string; label?: string }[];
    };
    if (!isDisplayEmail || !isDisplayName)
      throw new ValidateError(
        [
          !isDisplayEmail && "isDisplayEmail",
          !isDisplayName && "isDisplayName",
        ].filter(Boolean)
      );

    const MAX_BIO = 500;
    const MAX_ADDRESS = 200;
    const MAX_URL = 2000;
    const MAX_PHONE = 20;
    const MAX_ACHIEVEMENTS = 50;
    const MAX_FEATURED_PROJECTS = 5;
    const MAX_SKILL_TAGS = 20;
    const MAX_CATEGORY_LEN = 50;
    const MAX_ITEMS_PER_TAG = 30;
    const MAX_ITEM_LEN = 50;
    const MAX_OVERRIDE_LEN = 1000;
    const MAX_CREDLY_BADGES = 4;
    const MAX_BADGE_LABEL = 100;
    const URL_RE = /^https?:\/\//i;
    const UUID_RE = /^[0-9a-f-]{36}$/i;
    const PHONE_RE = /^[\d\s\-+().]*$/;

    if (bio !== undefined && bio.length > MAX_BIO) return res.status(400).json({ error: `Bio too long (max ${MAX_BIO})` });
    if (photoMode !== undefined && !["none", "42campus", "custom"].includes(photoMode)) return res.status(400).json({ error: "Invalid photoMode" });
    if (phone !== undefined && phone && (phone.length > MAX_PHONE || !PHONE_RE.test(phone))) return res.status(400).json({ error: "Invalid phone format" });
    if (address !== undefined && address && address.length > MAX_ADDRESS) return res.status(400).json({ error: `Address too long (max ${MAX_ADDRESS})` });
    if (githubUrl !== undefined && githubUrl && (!URL_RE.test(githubUrl) || githubUrl.length > MAX_URL)) return res.status(400).json({ error: "Invalid GitHub URL" });
    if (linkedinUrl !== undefined && linkedinUrl && (!URL_RE.test(linkedinUrl) || linkedinUrl.length > MAX_URL)) return res.status(400).json({ error: "Invalid LinkedIn URL" });
    if (websiteUrl !== undefined && websiteUrl && (!URL_RE.test(websiteUrl) || websiteUrl.length > MAX_URL)) return res.status(400).json({ error: "Invalid website URL" });
    if (selectedAchievementIds !== undefined && (!Array.isArray(selectedAchievementIds) || selectedAchievementIds.length > MAX_ACHIEVEMENTS)) return res.status(400).json({ error: "Invalid achievement IDs" });
    if (featuredProjectIds !== undefined && (!Array.isArray(featuredProjectIds) || featuredProjectIds.length > MAX_FEATURED_PROJECTS)) return res.status(400).json({ error: `Max ${MAX_FEATURED_PROJECTS} featured projects` });
    if (skillTags !== undefined) {
      if (!Array.isArray(skillTags) || skillTags.length > MAX_SKILL_TAGS) return res.status(400).json({ error: "Invalid skillTags" });
      for (const t of skillTags) {
        if (typeof t?.category !== "string" || t.category.length > MAX_CATEGORY_LEN) return res.status(400).json({ error: "Invalid skill category" });
        if (!Array.isArray(t?.items) || t.items.length > MAX_ITEMS_PER_TAG || t.items.some((i: string) => typeof i !== "string" || i.length > MAX_ITEM_LEN)) return res.status(400).json({ error: "Invalid skill items" });
      }
    }
    if (projectDescriptionOverrides !== undefined) {
      if (typeof projectDescriptionOverrides !== "object" || Array.isArray(projectDescriptionOverrides)) return res.status(400).json({ error: "Invalid project overrides" });
      for (const [k, v] of Object.entries(projectDescriptionOverrides)) {
        if (typeof k !== "string" || typeof v !== "string" || v.length > MAX_OVERRIDE_LEN) return res.status(400).json({ error: "Invalid project override value" });
      }
    }
    if (credlyBadges !== undefined) {
      if (!Array.isArray(credlyBadges) || credlyBadges.length > MAX_CREDLY_BADGES) return res.status(400).json({ error: `Max ${MAX_CREDLY_BADGES} Credly badges` });
      for (const b of credlyBadges) {
        if (typeof b?.id !== "string" || !UUID_RE.test(b.id)) return res.status(400).json({ error: "Invalid Credly badge ID" });
        if (b.label !== undefined && (typeof b.label !== "string" || b.label.length > MAX_BADGE_LABEL)) return res.status(400).json({ error: `Credly badge label too long (max ${MAX_BADGE_LABEL})` });
      }
    }

    const token = await getToken({ req });
    if (!token) throw new AuthError();

    await prisma.user.update({
      where: {
        email: token.email,
      },
      data: {
        isDisplayEmail: isDisplayEmail === "true",
        isDisplayName: isDisplayName === "true",
        ...(isDisplayPhoto !== undefined && {
          isDisplayPhoto: isDisplayPhoto === "true",
        }),
        ...(isDisplayProjectCount !== undefined && {
          isDisplayProjectCount: isDisplayProjectCount === "true",
        }),
        ...(isPublicProfile !== undefined && {
          isPublicProfile: isPublicProfile === "true",
        }),
        ...(isDisplayOutstandingVotes !== undefined && {
          isDisplayOutstandingVotes: isDisplayOutstandingVotes === "true",
        }),
        ...(selectedAchievementIds !== undefined && {
          selectedAchievementIds: { set: selectedAchievementIds },
        }),
        ...(githubUrl !== undefined && { githubUrl: githubUrl || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl || null }),
        ...(websiteUrl !== undefined && { websiteUrl: websiteUrl || null }),
        ...(address !== undefined && { address: address || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(defaultDarkMode !== undefined && { defaultDarkMode: defaultDarkMode === "true" }),
        ...(isDisplayCampusCohortRank !== undefined && { isDisplayCampusCohortRank: isDisplayCampusCohortRank === "true" }),
        ...(isDisplayCohortRank !== undefined && { isDisplayCohortRank: isDisplayCohortRank === "true" }),
        ...(isDisplayAllTimeRank !== undefined && { isDisplayAllTimeRank: isDisplayAllTimeRank === "true" }),
        ...(isDisplayJourney !== undefined && { isDisplayJourney: isDisplayJourney === "true" }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(featuredProjectIds !== undefined && {
          featuredProjectIds: { set: featuredProjectIds },
        }),
        ...(skillTags !== undefined && { skillTags }),
        ...(projectDescriptionOverrides !== undefined && { projectDescriptionOverrides }),
        ...(credlyBadges !== undefined && { credlyBadges }),
        ...(photoMode !== undefined && { photoMode }),
      },
    });

    return res.status(200).json({
      message: "success",
    });
  } catch (error) {
    if (error instanceof ValidateError) {
      return res.status(400).json({
        error: error.message,
      });
    }
    if (error instanceof AuthError) {
      return res.status(401).json({
        error: error.message,
      });
    }
    console.error(error);
    throw error;
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return GetHandler(req, res);
    case "DELETE":
      return DeleteHandler(req, res);
    case "PATCH":
      return PatchHandler(req, res);
    default:
      return res.status(405).json({ error: "method not allowed" });
  }
}
