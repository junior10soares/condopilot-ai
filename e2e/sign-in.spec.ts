import { expect, test } from "@playwright/test";

test.describe("sign-in", () => {
  test("unauthenticated user is redirected away from the app shell", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("wrong password shows a generic error and does not sign in", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("manager@condopilot.demo");
    await page.getByLabel("Senha").fill("wrong-password");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Email ou senha inválidos.")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("valid credentials sign in, reach the dashboard, and can sign out", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("manager@condopilot.demo");
    await page.getByLabel("Senha").fill("Demo@123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "Bem-vindo" })).toBeVisible();

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/sign-in/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
