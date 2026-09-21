import { expect, test } from "@playwright/test";

test("manager sees the delinquency table", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("manager@condopilot.demo");
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("link", { name: "Financeiro" }).click();
  await expect(page).toHaveURL(/\/billing/);
  await expect(page.getByRole("heading", { name: "Financeiro" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Fernanda Costa" })).toBeVisible();
});

test("resident sees only their own charge history", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("carlos@condopilot.demo");
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("link", { name: "Financeiro" }).click();
  await expect(page.getByRole("heading", { name: "Meu financeiro" })).toBeVisible();
  await expect(page.getByText("Pago")).toBeVisible();
});
