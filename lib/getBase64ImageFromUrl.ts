import axios from "axios";

export const getBase64ImageFromUrl = async (url: string) =>
  await axios
    .get(url, {
      responseType: "arraybuffer",
    })
    .then(
      (res) =>
        `data:${res.headers["content-type"]};base64,${Buffer.from(
          res.data
        ).toString("base64")}`
    );
