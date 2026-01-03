/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "oklch(0.12 0.01 270)",
        foreground: "oklch(0.98 0.005 270)",
        card: {
          DEFAULT: "oklch(0.16 0.012 270)",
          foreground: "oklch(0.98 0.005 270)",
        },
        popover: {
          DEFAULT: "oklch(0.14 0.01 270)",
          foreground: "oklch(0.98 0.005 270)",
        },
        primary: {
          DEFAULT: "oklch(0.65 0.22 270)",
          foreground: "oklch(1 0 0)",
        },
        secondary: {
          DEFAULT: "oklch(0.22 0.015 270)",
          foreground: "oklch(0.98 0.005 270)",
        },
        muted: {
          DEFAULT: "oklch(0.25 0.02 270)",
          foreground: "oklch(0.55 0.01 270)",
        },
        accent: {
          DEFAULT: "oklch(0.58 0.25 285)",
          foreground: "oklch(1 0 0)",
        },
        destructive: {
          DEFAULT: "oklch(0.55 0.25 25)",
          foreground: "oklch(1 0 0)",
        },
        border: "oklch(0.25 0.02 270)",
        input: "oklch(0.22 0.015 270)",
        ring: "oklch(0.65 0.22 270)",
        sidebar: {
          DEFAULT: "oklch(0.14 0.012 270)",
          foreground: "oklch(0.85 0.01 270)",
          primary: "oklch(0.65 0.22 270)",
          "primary-foreground": "oklch(1 0 0)",
          accent: "oklch(0.2 0.015 270)",
          "accent-foreground": "oklch(0.98 0.005 270)",
          border: "oklch(0.22 0.015 270)",
          ring: "oklch(0.65 0.22 270)",
        },
        success: "oklch(0.6 0.18 150)",
        warning: "oklch(0.7 0.2 80)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
