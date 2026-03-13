import pixelWidth from "string-pixel-width";

const calculateStringWidth = (str: string, fontsize: number) => {
  const size = pixelWidth(str, {
    font: "verdana",
    size: fontsize,
  });

  return parseInt(size.toFixed(0));
};

export default calculateStringWidth;
