import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

const db = new PrismaClient();

test("manager broadcasts via the agent, resident sees it in their notifications", async ({
  browser,
}) => {
  await db.notification.deleteMany({ where: { subject: "Aviso do condomínio" } });

  const managerContext = await browser.newContext();
  const managerPage = await managerContext.newPage();
  await managerPage.goto("/sign-in");
  await managerPage.getByLabel("Email").fill("manager@condopilot.demo");
  await managerPage.getByLabel("Senha").fill("Demo@123");
  await managerPage.getByRole("button", { name: "Entrar" }).click();
  await expect(managerPage).toHaveURL(/\/dashboard/);

  await managerPage.getByRole("link", { name: "Agente" }).click();
  await managerPage
    .getByLabel("Mensagem para o agente")
    .fill("avisar os moradores sobre a assembleia de quinta-feira");
  await managerPage.getByRole("button", { name: "Enviar" }).click();
  await expect(managerPage.getByText("aguardando confirmação")).toBeVisible({ timeout: 10_000 });
  await managerPage.getByRole("button", { name: "Confirmar" }).click();
  await expect(managerPage.getByText(/Aviso simulado enviado para/)).toBeVisible({
    timeout: 10_000,
  });
  await managerContext.close();

  const residentContext = await browser.newContext();
  const residentPage = await residentContext.newPage();
  await residentPage.goto("/sign-in");
  await residentPage.getByLabel("Email").fill("carlos@condopilot.demo");
  await residentPage.getByLabel("Senha").fill("Demo@123");
  await residentPage.getByRole("button", { name: "Entrar" }).click();
  await expect(residentPage).toHaveURL(/\/dashboard/);

  await residentPage.getByRole("link", { name: "Notificações" }).click();
  await expect(residentPage.getByText("assembleia de quinta-feira")).toBeVisible();
  await residentContext.close();

  await db.$disconnect();
});
