import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import fs from "fs";
import path from "path";
import prisma from "../../db";

const PHOTO_DIR = "/data/cv_photos";

function ensurePhotoDir() {
  if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR, { recursive: true });
}

export const config = {
  api: { bodyParser: { sizeLimit: "1mb" } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const token = await getToken({ req });
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const user = await prisma.user.findUnique({ where: { email: token.email! }, select: { id: true } });
      if (!user) return res.status(404).json({ error: "User not found" });

      for (const ext of ["jpg", "png"]) {
        const filePath = path.join(PHOTO_DIR, `${user.id}.${ext}`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await prisma.user.update({ where: { id: user.id }, data: { customPhotoUrl: null, photoMode: "none" } });
      return res.status(200).json({ message: "deleted" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Delete failed" });
    }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = await getToken({ req });
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { dataUrl } = req.body as { dataUrl?: string };
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return res.status(400).json({ error: "Invalid image data" });
  }

  const mimeMatch = dataUrl.match(/^data:(image\/(?:jpeg|png));base64,/);
  if (!mimeMatch) {
    return res.status(400).json({ error: "Only JPG and PNG are supported" });
  }

  // Check base64 size (~75% of actual bytes)
  const base64Data = dataUrl.split(",")[1];
  const sizeBytes = Math.ceil((base64Data.length * 3) / 4);
  if (sizeBytes > 200 * 1024) {
    return res.status(400).json({ error: "Image exceeds 200 KB limit" });
  }

  // Validate magic bytes to prevent MIME spoofing
  const bytes = Buffer.from(base64Data, "base64");
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (!isJpeg && !isPng) {
    return res.status(400).json({ error: "File content does not match a valid JPG or PNG image" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: token.email! }, select: { id: true } });
    if (!user) return res.status(404).json({ error: "User not found" });

    ensurePhotoDir();
    const ext = isPng ? "png" : "jpg";
    // Remove old file with different extension
    const otherExt = isPng ? "jpg" : "png";
    const otherPath = path.join(PHOTO_DIR, `${user.id}.${otherExt}`);
    if (fs.existsSync(otherPath)) fs.unlinkSync(otherPath);

    const filePath = path.join(PHOTO_DIR, `${user.id}.${ext}`);
    fs.writeFileSync(filePath, bytes);

    const photoUrl = `${process.env.NEXTAUTH_URL}/api/photos/${user.id}`;

    await prisma.user.update({
      where: { id: user.id },
      data: { customPhotoUrl: photoUrl, photoMode: "custom" },
    });

    return res.status(200).json({ url: photoUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
}
