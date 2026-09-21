import { expect, test } from "@playwright/test";

// docs/testing-strategy.md § Smoke: startup, health endpoint, DB connectivity,
// authentication, one agent request, one tool execution — against a running instance.
test("smoke: app is up, healthy, and a signed-in user can run one agent turn", async ({
  page,
  request,
}) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBe(true);
  expect(await health.json()).toEqual({ status: "ok", database: "connected" });

  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("manager@condopilot.demo");
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("link", { name: "Agente" }).click();
  await page.getByLabel("Mensagem para o agente").fill("está aí?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("sucesso")).toBeVisible({ timeout: 10_000 });
});
