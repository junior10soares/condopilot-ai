import { expect, test } from "@playwright/test";

test("resident cannot access the security center", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("carlos@condopilot.demo");
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/security");
  await expect(page).toHaveURL(/\/dashboard/);
});

test("manager sees a denied action after a resident tries a manager-only tool", async ({
  browser,
}) => {
  const residentContext = await browser.newContext();
  const residentPage = await residentContext.newPage();
  await residentPage.goto("/sign-in");
  await residentPage.getByLabel("Email").fill("carlos@condopilot.demo");
  await residentPage.getByLabel("Senha").fill("Demo@123");
  await residentPage.getByRole("button", { name: "Entrar" }).click();
  await expect(residentPage).toHaveURL(/\/dashboard/);

  await residentPage.getByRole("link", { name: "Agente" }).click();
  await residentPage
    .getByLabel("Mensagem para o agente")
    .fill("Quais moradores estão inadimplentes?");
  await residentPage.getByRole("button", { name: "Enviar" }).click();
  await expect(residentPage.getByText("negado")).toBeVisible({ timeout: 10_000 });
  await residentContext.close();

  const managerContext = await browser.newContext();
  const managerPage = await managerContext.newPage();
  await managerPage.goto("/sign-in");
  await managerPage.getByLabel("Email").fill("manager@condopilot.demo");
  await managerPage.getByLabel("Senha").fill("Demo@123");
  await managerPage.getByRole("button", { name: "Entrar" }).click();
  await expect(managerPage).toHaveURL(/\/dashboard/);

  await managerPage.getByRole("link", { name: "Segurança" }).click();
  await expect(managerPage).toHaveURL(/\/security/);
  await expect(managerPage.getByRole("cell", { name: "Carlos Silva" })).toBeVisible();
  await expect(managerPage.getByText("Negado").first()).toBeVisible();
  await managerContext.close();
});
