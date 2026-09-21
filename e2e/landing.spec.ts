import { expect, test } from "@playwright/test";

test("landing page shows the hero and demo mockup for an anonymous visitor", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Ele age\./ })).toBeVisible();
  await expect(page.getByText("Quais moradores estão inadimplentes?")).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar na demo" })).toBeVisible();
});

test("a signed-in visitor hitting / is redirected straight to the dashboard", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("carlos@condopilot.demo");
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard/);
});
