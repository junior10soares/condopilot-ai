import { expect, test } from "@playwright/test";

test("manager sees the resident directory with unmasked emails", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("manager@condopilot.demo");
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("link", { name: "Moradores" }).click();
  await expect(page).toHaveURL(/\/residents/);

  await expect(page.getByRole("cell", { name: "Carlos Silva" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "carlos@condopilot.demo" })).toBeVisible();
});
