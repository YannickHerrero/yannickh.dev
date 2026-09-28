import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { themes } from "../../src/data/themes";

test("leader W opens coverflow, arrows preview, Escape cancels and Enter applies", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(page.locator('.desktop[data-ready="true"]')).toBeVisible();
  await page.locator("#project-link-illium").focus();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("w");
  await expect(
    page.getByRole("dialog", { name: "Switch theme" })
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Theme previews" })
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("button", { name: "Apply Akane", exact: true })
  ).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", "akane");
  await page.keyboard.press("Escape");
  await expect(page.locator("#project-link-illium")).toBeFocused();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("w");
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("button", { name: "Apply Catppuccin Latte", exact: true })
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/themes-${info.project.name}.png`,
    animations: "disabled",
  });
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "latte");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "latte");
  await page.goto("/work/illium");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "latte");
});

test("every theme and its picker remain accessible and use the right wallpaper", async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  await page.goto("/");
  await expect(page.locator('.desktop[data-ready="true"]')).toBeVisible();
  for (const theme of themes) {
    await page.getByRole("button", { name: /Commands/ }).click();
    await page.getByRole("combobox").fill("switch theme");
    await page.getByRole("option", { name: /Switch theme/ }).click();
    await expect(
      page.getByRole("dialog", { name: "Switch theme" })
    ).toBeVisible();
    for (
      let i = 0;
      i < themes.length &&
      !(await page
        .getByRole("button", { name: `Apply ${theme.name}`, exact: true })
        .count());
      i++
    ) {
      await page
        .getByRole("button", { name: "Next theme", exact: true })
        .click();
    }
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations
    ).toEqual([]);
    await page
      .getByRole("button", { name: `Apply ${theme.name}`, exact: true })
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme.id);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.body, "::before").backgroundImage
      )
    ).toContain(theme.wallpaper);
    expect((await request.get(theme.wallpaper)).ok()).toBe(true);
    expect((await request.get(theme.preview)).ok()).toBe(true);
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
        .violations,
      theme.name
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  }
});

test("legacy light preferences migrate and unknown themes fall back", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("portfolio-theme", "light")
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "latte");
  await page.addInitScript(() =>
    localStorage.setItem("portfolio-theme", "unknown")
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
