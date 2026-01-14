import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Catppuccin Macchiato - Accent Colors
        rosewater: "#F4DBD6",
        flamingo: "#F0C6C6",
        pink: "#F5BDE6",
        mauve: "#C6A0F6",
        red: "#ED8796",
        maroon: "#EE99A0",
        peach: "#F5A97F",
        yellow: "#EED49F",
        green: "#A6DA95",
        teal: "#8BD5CA",
        sky: "#91D7E3",
        sapphire: "#7DC4E4",
        blue: "#8AADF4",
        lavender: "#B7BDF8",

        // Catppuccin Macchiato - Neutral Colors
        text: {
          DEFAULT: "#CAD3F5",
          light: "#DDE3F9",
        },
        subtext: {
          0: "#A5ADCB",
          1: "#B8C0E0",
        },
        overlay: {
          0: "#6E738D",
          1: "#8087A2",
          2: "#939AB7",
        },
        surface: {
          0: "#363A4F",
          1: "#494D64",
          2: "#5B6078",
        },
        base: "#24273A",
        mantle: "#1E2030",
        crust: "#181926",

        // Semantic aliases
        accent: {
          DEFAULT: "#B7BDF8", // Lavender
          light: "#CAD0FA",
          dark: "#A5ABF6",
        },
      },
      fontFamily: {
        sans: ["Raleway", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(183, 189, 248, 0.08), transparent)",
        "card-glow":
          "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(183, 189, 248, 0.06), transparent 40%)",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#B8C0E0",
            "--tw-prose-headings": "#DDE3F9",
            "--tw-prose-lead": "#B8C0E0",
            "--tw-prose-links": "#B7BDF8",
            "--tw-prose-bold": "#DDE3F9",
            "--tw-prose-counters": "#A5ADCB",
            "--tw-prose-bullets": "#A5ADCB",
            "--tw-prose-hr": "rgba(110, 115, 141, 0.5)",
            "--tw-prose-quotes": "#DDE3F9",
            "--tw-prose-quote-borders": "rgba(183, 189, 248, 0.3)",
            "--tw-prose-captions": "#A5ADCB",
            "--tw-prose-code": "#DDE3F9",
            "--tw-prose-pre-code": "#B8C0E0",
            "--tw-prose-pre-bg": "rgba(54, 58, 79, 0.5)",
            "--tw-prose-th-borders": "rgba(110, 115, 141, 0.5)",
            "--tw-prose-td-borders": "rgba(110, 115, 141, 0.3)",
            maxWidth: "none",
            code: {
              backgroundColor: "rgba(54, 58, 79, 0.8)",
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
              color: "#B7BDF8",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
              textDecorationColor: "rgba(183, 189, 248, 0.3)",
              "&:hover": {
                textDecorationColor: "rgba(183, 189, 248, 0.6)",
              },
            },
            pre: {
              backgroundColor: "rgba(54, 58, 79, 0.5)",
              border: "1px solid rgba(110, 115, 141, 0.3)",
            },
            thead: {
              borderBottomColor: "rgba(110, 115, 141, 0.5)",
            },
            "tbody tr": {
              borderBottomColor: "rgba(110, 115, 141, 0.3)",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
