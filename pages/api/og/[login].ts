import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../db";
import fs from "fs";
import path from "path";

const OG_CACHE_MS = 6 * 60 * 60 * 1000;
const CACHE_DIR = "/tmp/og_cache";

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function takeScreenshot(login: string): Promise<Buffer> {
  const puppeteer = await import("puppeteer-core");
  const browser = await puppeteer.default.launch({
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      "/nix/var/nix/profiles/default/bin/chromium",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });
    await page.goto(`http://localhost:3000/${login}?preview=1`, {
      waitUntil: "networkidle0",
      timeout: 15000,
    });
    const buffer = await page.screenshot({ type: "png" });
    return Buffer.from(buffer);
  } finally {
    await browser.close();
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const login = req.query.login as string;
  if (!login) return res.status(400).json({ error: "Missing login" });

  try {
    const user = await prisma.user.findFirst({
      where: {
        ftSchoolVerified: true,
        extended42Data: { path: ["login"], equals: login },
      } as any,
      select: {
        id: true,
        ogImageUrl: true,
        ogImageAt: true,
        isPublicProfile: true,
      } as any,
    });

    if (!user || !(user as any).isPublicProfile) {
      return res.status(404).json({ error: "Not found" });
    }

    ensureCacheDir();
    const cachePath = path.join(CACHE_DIR, `${login}.png`);
    const ogImageAt = (user as any).ogImageAt as Date | null;

    if (
      ogImageAt &&
      Date.now() - new Date(ogImageAt).getTime() < OG_CACHE_MS &&
      fs.existsSync(cachePath)
    ) {
      const png = fs.readFileSync(cachePath);
      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=21600, stale-while-revalidate=43200"
      );
      return res.send(png);
    }

    let pngBuffer: Buffer;
    try {
      pngBuffer = await takeScreenshot(login);
    } catch (err: any) {
      console.error(`[og] Screenshot failed for ${login}:`, err.message);
      if (fs.existsSync(cachePath)) {
        const png = fs.readFileSync(cachePath);
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, s-maxage=3600");
        return res.send(png);
      }
      return res.status(502).json({ error: "Screenshot failed" });
    }

    fs.writeFileSync(cachePath, pngBuffer);

    await prisma.user.update({
      where: { id: user.id as unknown as string },
      data: { ogImageUrl: `https://42cv.dev/api/og/${login}`, ogImageAt: new Date() } as any,
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=21600, stale-while-revalidate=43200"
    );
    return res.send(pngBuffer);
  } catch (err: any) {
    console.error(`[og] Error for ${login}:`, err.message);
    return res.status(500).json({ error: "Internal error" });
  }
}
