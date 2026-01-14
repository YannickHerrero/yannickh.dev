import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#B2D7FC",
          light: "#D0E7FD",
          dark: "#8AC4FA",
        },
        surface: {
          DEFAULT: "#2C2C2E",
          dark: "#1C1C1E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 255, 255, 0.08), transparent)",
        "card-glow":
          "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.06), transparent 40%)",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#a1a1a1",
            "--tw-prose-headings": "#ffffff",
            "--tw-prose-lead": "#a1a1a1",
            "--tw-prose-links": "#ffffff",
            "--tw-prose-bold": "#ffffff",
            "--tw-prose-counters": "#888888",
            "--tw-prose-bullets": "#888888",
            "--tw-prose-hr": "rgba(255, 255, 255, 0.1)",
            "--tw-prose-quotes": "#ffffff",
            "--tw-prose-quote-borders": "rgba(255, 255, 255, 0.2)",
            "--tw-prose-captions": "#888888",
            "--tw-prose-code": "#ffffff",
            "--tw-prose-pre-code": "#a1a1a1",
            "--tw-prose-pre-bg": "rgba(255, 255, 255, 0.05)",
            "--tw-prose-th-borders": "rgba(255, 255, 255, 0.1)",
            "--tw-prose-td-borders": "rgba(255, 255, 255, 0.05)",
            maxWidth: "none",
            code: {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
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
              textDecoration: "underline",
              textUnderlineOffset: "2px",
              textDecorationColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                textDecorationColor: "rgba(255, 255, 255, 0.6)",
              },
            },
            pre: {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
            thead: {
              borderBottomColor: "rgba(255, 255, 255, 0.1)",
            },
            "tbody tr": {
              borderBottomColor: "rgba(255, 255, 255, 0.05)",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
