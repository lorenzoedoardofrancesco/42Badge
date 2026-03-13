import { PrismaClient } from "@prisma/client";
import PQueue from "p-queue";

import fs from "fs/promises";
import sharp from "sharp";
import axios from "axios";
import path from "path";

const prisma = new PrismaClient({
  errorFormat: "minimal",
});

const queue = new PQueue({ concurrency: 16 });

const imageProcess = async (
  url: string,
  path: string,
  isSharp: boolean = false
) => {
  console.log(`start - ${url}`);

  try {
    const { data } = await queue.add(() =>
      axios.get(encodeURI(url), {
        responseType: isSharp ? "arraybuffer" : undefined,
      })
    );

    if (isSharp) {
      const imageBuffer = await sharp(data).jpeg({ mozjpeg: true }).toBuffer();
      fs.writeFile(path, imageBuffer);
    } else {
      fs.writeFile(path, data);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response.status === 404) {
      console.log(`skip(404) - ${url}`);
    } else {
      Promise.reject(error);
    }
  }
};

const main = async () => {
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
