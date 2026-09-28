export const themes = [
  {
    id: "dark",
    name: "Original",
    mode: "dark",
    description: "The original Illium-inspired workspace",
    wallpaper: "/images/wallpaper.svg",
    preview: "/images/wallpaper.svg",
  },
  {
    id: "akane",
    name: "Akane",
    mode: "dark",
    description: "Warm vermilion on deep ink",
    wallpaper: "/images/themes/akane.webp",
    preview: "/images/themes/akane-preview.webp",
  },
  {
    id: "snow",
    name: "Snow",
    mode: "light",
    description: "A quiet monochrome workspace",
    wallpaper: "/images/themes/snow.webp",
    preview: "/images/themes/snow-preview.webp",
  },
  {
    id: "ruins",
    name: "Ruins",
    mode: "dark",
    description: "Illium Dynamic Dark, sampled from ruins.jpg",
    wallpaper: "/images/themes/ruins.webp",
    preview: "/images/themes/ruins-preview.webp",
  },
  {
    id: "latte",
    name: "Catppuccin Latte",
    mode: "light",
    description: "Soft pastels and a warm daylight palette",
    wallpaper: "/images/themes/latte.webp",
    preview: "/images/themes/latte-preview.webp",
  },
] as const;
export type ThemeId = (typeof themes)[number]["id"];
export type Theme = (typeof themes)[number];

export function normalizeTheme(value: string | null | undefined): ThemeId {
  if (value === "light") return "latte"; // Preserve the previous light-mode preference.
  return themes.some((theme) => theme.id === value)
    ? (value as ThemeId)
    : "dark";
}

export function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
  const base = getComputedStyle(document.documentElement)
    .getPropertyValue("--base")
    .trim();
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", `rgb(${base})`);
  try {
    localStorage.setItem("portfolio-theme", id);
  } catch {
    /* Preferences are optional. */
  }
}
