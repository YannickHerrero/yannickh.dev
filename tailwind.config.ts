import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    // Custom font sizes matching Studio template
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.5rem" }],
      base: ["1rem", { lineHeight: "1.75rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "2rem" }],
      "2xl": ["1.5rem", { lineHeight: "2.25rem" }],
      "3xl": ["1.75rem", { lineHeight: "2.25rem" }],
      "4xl": ["2rem", { lineHeight: "2.5rem" }],
      "5xl": ["2.5rem", { lineHeight: "3rem" }],
      "6xl": ["3rem", { lineHeight: "3.5rem" }],
      "7xl": ["4rem", { lineHeight: "4.5rem" }],
    },
    extend: {
      colors: {
        // Studio-inspired neutral palette (light theme)
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        "4xl": "2.5rem",
      },
      spacing: {
        "132": "33rem",
        "135": "33.75rem",
        "180": "45rem",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#525252",
            "--tw-prose-headings": "#0a0a0a",
            "--tw-prose-lead": "#525252",
            "--tw-prose-links": "#0a0a0a",
            "--tw-prose-bold": "#0a0a0a",
            "--tw-prose-counters": "#737373",
            "--tw-prose-bullets": "#737373",
            "--tw-prose-hr": "#e5e5e5",
            "--tw-prose-quotes": "#0a0a0a",
            "--tw-prose-quote-borders": "#e5e5e5",
            "--tw-prose-captions": "#737373",
            "--tw-prose-code": "#0a0a0a",
            "--tw-prose-pre-code": "#525252",
            "--tw-prose-pre-bg": "#f5f5f5",
            "--tw-prose-th-borders": "#d4d4d4",
            "--tw-prose-td-borders": "#e5e5e5",
            maxWidth: "none",
            code: {
              backgroundColor: "#f5f5f5",
              padding: "0.125rem 0.375rem",
              borderRadius: "0.375rem",
              fontWeight: "400",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            a: {
              color: "#0a0a0a",
              textDecoration: "underline",
              textUnderlineOffset: "0.15em",
              textDecorationThickness: "1px",
              textDecorationColor: "rgba(10, 10, 10, 0.3)",
              "&:hover": {
                textDecorationColor: "rgba(10, 10, 10, 0.6)",
              },
            },
            pre: {
              backgroundColor: "#f5f5f5",
              border: "1px solid #e5e5e5",
            },
            thead: {
              borderBottomColor: "#d4d4d4",
            },
            "tbody tr": {
              borderBottomColor: "#e5e5e5",
            },
          },
        },
        invert: {
          css: {
            "--tw-prose-body": "#a3a3a3",
            "--tw-prose-headings": "#ffffff",
            "--tw-prose-lead": "#a3a3a3",
            "--tw-prose-links": "#ffffff",
            "--tw-prose-bold": "#ffffff",
            "--tw-prose-counters": "#a3a3a3",
            "--tw-prose-bullets": "#a3a3a3",
            "--tw-prose-hr": "#404040",
            "--tw-prose-quotes": "#ffffff",
            "--tw-prose-quote-borders": "#404040",
            "--tw-prose-captions": "#a3a3a3",
            "--tw-prose-code": "#ffffff",
            "--tw-prose-pre-code": "#a3a3a3",
            "--tw-prose-pre-bg": "#262626",
            "--tw-prose-th-borders": "#525252",
            "--tw-prose-td-borders": "#404040",
            code: {
              backgroundColor: "#262626",
            },
            a: {
              color: "#ffffff",
              textDecorationColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                textDecorationColor: "rgba(255, 255, 255, 0.6)",
              },
            },
            pre: {
              backgroundColor: "#262626",
              border: "1px solid #404040",
            },
            thead: {
              borderBottomColor: "#525252",
            },
            "tbody tr": {
              borderBottomColor: "#404040",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
