import { expect, test } from "@playwright/test";

// A phone-width viewport on the already-installed chromium project — no need for a separate
// WebKit/mobile-device install just to check for layout overflow.
test.use({ viewport: { width: 390, height: 844 } });

test("landing and dashboard have no horizontal overflow at phone width", async ({ page }) => {
  await page.goto("/");
  let hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
  await expect(page.getByRole("link", { name: "Entrar na demo" })).toBeVisible();

  await page.getByRole("link", { name: "Entrar", exact: true }).click();
  await page.getByLabel("Email").fill("manager@condopilot.demo");
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});
