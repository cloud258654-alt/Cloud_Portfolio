const ktsPreset = require("../spec/UI/tailwind.preset.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [ktsPreset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
