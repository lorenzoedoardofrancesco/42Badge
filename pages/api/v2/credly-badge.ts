import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const token = await getToken({ req });
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.query as { id?: string };
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ message: "Invalid badge ID" });
  }

  try {
    // Try JSON API first
    const jsonRes = await fetch(`https://www.credly.com/badges/${id}/public_json`, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    });
    const json = await jsonRes.json().catch(() => null);
    const bt = json?.data?.badge_template;

    if (bt?.name && bt?.image_url) {
      return res.status(200).json({
        name: bt.name,
        imageUrl: bt.image_url,
        issuer: bt.issuer?.name ?? null,
      });
    }

    // Fallback: scrape the badge page HTML for image and title
    const htmlRes = await fetch(`https://www.credly.com/badges/${id}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const html = await htmlRes.text();

    const imageMatch = html.match(/https:\/\/images\.credly\.com\/images\/[^"'\s]+/);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/name=['"]description['"][^>]*content=['"]([^'"]+)['"]/i);

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

    return res.status(200).json({
      name,
      imageUrl,
      issuer: null,
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch badge metadata" });
  }
}
