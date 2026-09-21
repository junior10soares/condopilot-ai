import { expect, test } from "@playwright/test";

test("manager sees the reservations page with the seeded common area", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("manager@condopilot.demo");
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("link", { name: "Reservas" }).click();
  await expect(page).toHaveURL(/\/reservations/);
  await expect(page.getByRole("heading", { name: "Reservas" })).toBeVisible();
  await expect(page.getByText("Áreas disponíveis: Salão de Festas")).toBeVisible();
});
