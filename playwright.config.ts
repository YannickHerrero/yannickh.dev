import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
    // Avoid the host's WSLg display when running headless browser checks.
    launchOptions: {
      args: ["--ozone-platform=headless", "--disable-gpu"],
      env: { ...process.env, DISPLAY: "", WAYLAND_DISPLAY: "" },
    },
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "bun run astro preview --host 127.0.0.1",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
  },
});
