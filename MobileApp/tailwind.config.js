/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"], // <- adjust path
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
