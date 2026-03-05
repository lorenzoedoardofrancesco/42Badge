const iOSHeight = require("@rvxlab/tailwind-plugin-ios-full-height");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [iOSHeight],
};
