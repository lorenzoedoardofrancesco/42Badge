import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { v2 as cloudinary } from "cloudinary";
import prisma from "../../db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      await cloudinary.uploader.destroy(`cv_photos/${user.id}`).catch(() => {});
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

    const result = await cloudinary.uploader.upload(dataUrl, {
      public_id: `cv_photos/${user.id}`,
      overwrite: true,
      transformation: [{ width: 512, height: 512, crop: "limit" }],
      format: "jpg",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { customPhotoUrl: result.secure_url, photoMode: "custom" },
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
}
