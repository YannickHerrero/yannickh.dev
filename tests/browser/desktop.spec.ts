import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openCommands(
  page: import("@playwright/test").Page,
  query: string
) {
  await page.getByRole("button", { name: /Commands/ }).click();
  await page.getByRole("combobox", { name: "Search commands" }).fill(query);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.desktop[data-ready="true"]')).toBeVisible();
});

test("Home fills the available workspace with left-aligned content", async ({
  page,
}) => {
  const main = await page.locator(".desktop-main").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      width:
        element.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight),
      left:
        element.getBoundingClientRect().left + parseFloat(style.paddingLeft),
    };
  });
  const home = await page.locator("#window-home").boundingBox();
  expect(home!.width).toBeCloseTo(main.width, 0);
  expect(home!.x).toBeCloseTo(main.left, 0);
  expect(
    await page
      .locator(".home-content")
      .evaluate((element) => getComputedStyle(element).textAlign)
  ).not.toBe("center");
});

test("mouse navigation, tiling, maximize, close and history", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.locator("#project-link-aniplayer-ios").click();
  await expect(page.locator("#window-aniplayer-ios")).toBeVisible();
  await expect(page).toHaveURL(/panel=aniplayer-ios/);
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Home", exact: true }).click();
  await page
    .getByRole("button", { name: "Open Explorer alongside", exact: true })
    .click();
  await expect(page.locator("#window-explorer")).toBeVisible();
  await expect(page.locator(".detail-tile")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Maximize Explorer", exact: true })
    .click();
  await expect(page.locator("#window-home")).toBeHidden();
  await page
    .getByRole("button", { name: "Restore Explorer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Close Explorer", exact: true })
    .click();
  await expect(page.locator("#project-link-explorer")).toBeFocused();
  await page.goBack();
  await expect(page.locator("#window-explorer")).toBeVisible();
  await page.reload();
  await expect(page.locator("#window-explorer")).toBeVisible();
  expect(errors).toEqual([]);
});

test("keyboard-only project navigation and command actions", async ({
  page,
}) => {
  await page.keyboard.press("/");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.type("Aniplayer iOS");
  await page.keyboard.press("Enter");
  await expect(page.locator("#window-aniplayer-ios")).toBeFocused();
  await page.keyboard.press("Control+k");
  await page.keyboard.type("Close Aniplayer");
  await page.keyboard.press("Enter");
  await expect(page.locator("#project-link-aniplayer-ios")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#project-link-explorer")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#window-explorer")).toBeFocused();
  await page.keyboard.press("?");
  await expect(
    page.getByRole("dialog", { name: "Keyboard & navigation" })
  ).toBeVisible();
  await expect(page.locator("#window-help")).toHaveCount(0);
  await expect(page.locator(".detail-tile")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("#window-explorer")).toBeFocused();
});

test("help is a modal without changing windows or the URL", async ({
  page,
}) => {
  await page.locator("#project-link-illium").click();
  await expect(page.locator("#window-illium")).toBeFocused();
  const url = page.url();
  await page.getByRole("link", { name: "Help ?" }).click();
  const dialog = page.getByRole("dialog", { name: "Keyboard & navigation" });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(url);
  await expect(page.locator(".detail-tile")).toHaveCount(1);
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations
  ).toEqual([]);
  await page.getByRole("button", { name: "Close help" }).click();
  await expect(page.getByRole("link", { name: "Help ?" })).toBeFocused();
  await openCommands(page, "Keyboard help");
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
});

test("project commands have one descriptive entry and open alongside", async ({
  page,
}) => {
  await openCommands(page, "Illium");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page
    .getByRole("option", { name: "Projects Illium - Desktop environment" })
    .click();
  await expect(page.locator("#window-illium")).toBeFocused();
  await openCommands(page, "Explorer");
  await page
    .getByRole("option", { name: "Projects Explorer - Windows utility" })
    .click();
  await expect(page.locator("#window-explorer")).toBeFocused();
  await expect(page.locator(".detail-tile")).toHaveCount(2);
});

test("palette mouse selection, empty results, focus restoration and preferences", async ({
  page,
}) => {
  await openCommands(page, "no-such-project-xyz");
  await expect(
    page.getByText("No commands found", { exact: false })
  ).toBeVisible();
  await page.getByRole("combobox").fill("Switch to light");
  await page.getByRole("option", { name: /Switch to light/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await openCommands(page, "opaque");
  await page.getByRole("option", { name: /Use opaque/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-opaque", "true");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-opaque", "true");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: /Commands/ }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /Commands/ })).toBeFocused();
});

test("separator supports keyboard and pointer resizing", async ({
  page,
}, info) => {
  test.skip(
    info.project.name === "mobile",
    "Single-window mobile layout has no separator"
  );
  await page.locator("#project-link-illium").click();
  await expect(page.locator("#window-illium")).toBeFocused();
  const separator = page.getByRole("separator");
  await separator.focus();
  await page.keyboard.press("ArrowRight");
  await expect(separator).toHaveAttribute("aria-valuenow", "37");
  const bounds = await separator.boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + 100);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + 75, bounds!.y + 100);
  await page.mouse.up();
  expect(Number(await separator.getAttribute("aria-valuenow"))).toBeGreaterThan(
    37
  );
});

test("no horizontal overflow and screenshots", async ({ page }, info) => {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  await page.screenshot({
    path: `test-results/home-${info.project.name}.png`,
    fullPage: true,
  });
  await page.locator("#project-link-aniplayer-ios").click();
  await expect(page.locator("#window-aniplayer-ios img")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("#window-aniplayer-ios img")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
        )
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  await page.screenshot({
    path: `test-results/project-${info.project.name}.png`,
    fullPage: true,
  });
});

test("accessible home, project, palette and light theme", async ({ page }) => {
  const scan = async () =>
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations
    ).toEqual([]);
  await scan();
  await page.locator("#project-link-aniplayer-ios").click();
  await scan();
  await openCommands(page, "");
  await scan();
  await page.getByRole("combobox").fill("Switch to light");
  await page.keyboard.press("Enter");
  await scan();
});

test("all curated pages and screenshots resolve", async ({ page, request }) => {
  const links = await page
    .locator(".project-link")
    .evaluateAll((items) =>
      items.map((item) => (item as HTMLAnchorElement).pathname)
    );
  for (const href of links) {
    const response = await request.get(href);
    expect(response.ok(), href).toBe(true);
  }
  for (const image of [
    "aniplayer",
    "explorer",
    "sovereign",
    "solaris",
    "traki",
  ]) {
    expect((await request.get(`/images/${image}.webp`)).ok()).toBe(true);
  }
});

test("small screens, blocked storage and reduced motion remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
  });
  await page.reload();
  await expect(page.locator('.desktop[data-ready="true"]')).toBeVisible();
  await page.locator("#project-link-illium").click();
  await expect(page.locator("#window-illium")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  await openCommands(page, "light theme");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("direct URLs, no-JavaScript fallback and legacy pages", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await page.locator("#project-link-aniplayer-ios").click();
  await expect(page).toHaveURL(/\/work\/aniplayer-ios/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Aniplayer iOS"
  );
  await page.goto("/project/yannickherrero-mira");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("mira");
  await page.goto("/contact");
  await expect(
    page.getByRole("link", { name: /hello@yannickh.dev/ })
  ).toBeVisible();
  await context.close();
});
