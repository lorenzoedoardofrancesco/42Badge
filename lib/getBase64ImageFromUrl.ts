import axios from "axios";

const ALLOWED_HOSTS = new Set([
  "cdn.intra.42.fr",
  "images.credly.com",
  "42cv.dev",
  "localhost",
]);

export const getBase64ImageFromUrl = async (url: string) => {
  const parsed = new URL(url);
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`Image host not allowed: ${parsed.hostname}`);
  }
  return await axios
    .get(url, {
      responseType: "arraybuffer",
      timeout: 10000,
      maxContentLength: 2 * 1024 * 1024, // 2MB max
    })
    .then(
      (res) =>
        `data:${res.headers["content-type"]};base64,${Buffer.from(
          res.data
        ).toString("base64")}`
    );
};
