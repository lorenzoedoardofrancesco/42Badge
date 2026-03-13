import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import prisma from "../../db";

// Normalize a name for comparison: lowercase, strip accents, remove punctuation, collapse spaces
function normalizeName(name: string): string {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents: é→e, ü→u
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Returns true if the two names plausibly belong to the same person.
// Requires at least 2 matching words; falls back to 1 if either name is a single word.
function namesMatch(a: string, b: string): boolean {
  const wa = normalizeName(a).split(" ").filter((w) => w.length > 1);
  const wb = normalizeName(b).split(" ").filter((w) => w.length > 1);
  if (wa.length === 0 || wb.length === 0) return false;
  const matches = wa.filter((w) => wb.includes(w)).length;
  return matches >= Math.min(2, Math.min(wa.length, wb.length));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const token = await getToken({ req });
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.query as { id?: string };
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ message: "Invalid badge ID" });
  }

  // Get the user's real display name from DB (more reliable than token.name)
  const user = await prisma.user.findUnique({
    where: { email: token.email! },
    select: { extended42Data: true },
  });
  const displayName: string | null = (user?.extended42Data as any)?.displayname ?? null;

  try {
    // Try JSON API first
    const jsonRes = await fetch(`https://www.credly.com/badges/${id}/public_json`, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    const contentLength = parseInt(jsonRes.headers.get("content-length") ?? "0", 10);
    if (contentLength > 1024 * 1024) return res.status(502).json({ message: "Response too large" });
    const jsonText = await jsonRes.text();
    if (jsonText.length > 1024 * 1024) return res.status(502).json({ message: "Response too large" });
    const json = (() => { try { return JSON.parse(jsonText); } catch { return null; } })();
    const bt = json?.data?.badge_template;
    const recipient: string | null =
      json?.data?.user?.name ??
      (json?.data?.user?.first_name && json?.data?.user?.last_name
        ? `${json.data.user.first_name} ${json.data.user.last_name}`
        : null);

    if (bt?.name && bt?.image_url) {
      if (recipient && displayName && !namesMatch(recipient, displayName)) {
        return res.status(403).json({
          message: `This badge belongs to "${recipient}", not to your account.`,
        });
      }
      return res.status(200).json({
        name: bt.name,
        imageUrl: bt.image_url,
        issuer: bt.issuer?.name ?? null,
      });
    }

    // Fallback: scrape the badge page HTML
    const htmlRes = await fetch(`https://www.credly.com/badges/${id}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    const htmlContentLength = parseInt(htmlRes.headers.get("content-length") ?? "0", 10);
    if (htmlContentLength > 2 * 1024 * 1024) return res.status(502).json({ message: "Response too large" });
    const html = await htmlRes.text();
    if (html.length > 2 * 1024 * 1024) return res.status(502).json({ message: "Response too large" });

    // Extract recipient from og:title: "Badge Name was issued by Issuer to First Last."
    const ogTitleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i)
      ?? html.match(/content="([^"]+)"\s+property="og:title"/i);
    const issuedToMatch = ogTitleMatch?.[1]?.match(/\bto\s+(.+?)\s*\.?\s*$/);
    const htmlRecipient = issuedToMatch?.[1]?.trim() ?? null;

    const imageMatch = html.match(/https:\/\/images\.credly\.com\/images\/[^"'\s]+/);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    // Clean up title: remove " - Credly" suffix
    let name: string | null = null;
    if (titleMatch) {
      name = titleMatch[1].replace(/\s*[-–|].*Credly.*$/i, "").trim() || null;
    }

    // Get full-size image URL by stripping thumbnail prefixes
    let imageUrl: string | null = null;
    if (imageMatch) {
      imageUrl = imageMatch[0].replace(/\/(?:linkedin_thumb|twitter_thumb_\d+)_/, "/");
    }

    if (!imageUrl && !name) {
      return res.status(404).json({ message: "Badge not found or not public" });
    }

    // Verify recipient name
    if (htmlRecipient && displayName && !namesMatch(htmlRecipient, displayName)) {
      return res.status(403).json({
        message: `This badge belongs to "${htmlRecipient}", not to your account.`,
      });
    }

    return res.status(200).json({ name, imageUrl, issuer: null });
  } catch {
    return res.status(500).json({ message: "Failed to fetch badge metadata" });
  }
}
