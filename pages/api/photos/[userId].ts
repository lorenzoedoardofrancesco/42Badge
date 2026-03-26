import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const PHOTO_DIR = "/data/cv_photos";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const userId = req.query.userId as string;
  if (!userId || !/^[a-zA-Z0-9_-]+$/.test(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const jpgPath = path.join(PHOTO_DIR, `${userId}.jpg`);
  const pngPath = path.join(PHOTO_DIR, `${userId}.png`);

  let filePath: string;
  let contentType: string;

  if (fs.existsSync(jpgPath)) {
    filePath = jpgPath;
    contentType = "image/jpeg";
  } else if (fs.existsSync(pngPath)) {
    filePath = pngPath;
    contentType = "image/png";
  } else {
    return res.status(404).json({ error: "Photo not found" });
  }

  const photo = fs.readFileSync(filePath);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=172800");
  return res.send(photo);
}
