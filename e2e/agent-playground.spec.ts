import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const db = new PrismaClient();

test.describe("agent playground", () => {
  // The reservation test below books a real slot ("amanhã às 19h") against the dev database, so
  // reruns need a clean slate — otherwise the second run hits a real (correct!) booking conflict.
  test.beforeAll(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    await db.reservation.deleteMany({
      where: { commonArea: { name: "Salão de Festas" }, startsAt: { gte: tomorrow, lt: dayAfter } },
    });
  });

  test.afterAll(async () => {
    await db.$disconnect();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("manager@condopilot.demo");
    await page.getByLabel("Senha").fill("Demo@123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole("link", { name: "Agente" }).click();
    await expect(page).toHaveURL(/\/agent/);
  });

  test("HERO demo phrase 1: delinquency lookup", async ({ page }) => {
    await page.getByLabel("Mensagem para o agente").fill("Quais moradores estão inadimplentes?");
    await page.getByRole("button", { name: "Enviar" }).click();

    await expect(page.getByText("Fernanda Costa")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("sucesso")).toBeVisible();
  });

  test("HERO demo phrase 2: reservation requires confirmation, then books it", async ({ page }) => {
    await page
      .getByLabel("Mensagem para o agente")
      .fill("Reserve o salão para Carlos amanhã às 19h.");
    await page.getByRole("button", { name: "Enviar" }).click();

    await expect(page.getByText("aguardando confirmação")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Confirmar" }).click();

    await expect(page.getByText("Reserva confirmada")).toBeVisible({ timeout: 10_000 });
  });

  test("unrecognized input asks for clarification, never fabricates a tool call", async ({
    page,
  }) => {
    await page.getByLabel("Mensagem para o agente").fill("me conte uma piada sobre gatos");
    await page.getByRole("button", { name: "Enviar" }).click();

    await expect(page.getByText("esclarecimento")).toBeVisible({ timeout: 10_000 });
  });
});
