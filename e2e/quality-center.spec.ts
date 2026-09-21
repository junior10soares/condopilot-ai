import { expect, test } from "@playwright/test";

test("manager sees live test counts and the release-gate checklist", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("manager@condopilot.demo");
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("link", { name: "Qualidade" }).click();
  await expect(page).toHaveURL(/\/quality/);
  await expect(page.getByText(/testes unit\/component\/integration/)).toBeVisible();
  await expect(page.getByText(/cenários E2E/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Engenharia" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Segurança" })).toBeVisible();
});
