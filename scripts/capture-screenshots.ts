/**
 * One-off documentation asset generator — not a test, nothing to assert.
 * Run against a live instance: npm run dev (or build+start), then:
 *   npx tsx scripts/capture-screenshots.ts [baseUrl]
 * Saves PNGs to docs/screenshots/.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const outDir = path.resolve(__dirname, "../docs/screenshots");

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.goto(`${baseUrl}/sign-in`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/dashboard/);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  // Clear tomorrow's Salão de Festas slot so the reservation demo can show a real confirmation.
  const db = new PrismaClient();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  await db.reservation.deleteMany({
    where: { commonArea: { name: "Salão de Festas" }, startsAt: { gte: tomorrow, lt: dayAfter } },
  });
  await db.$disconnect();

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(baseUrl);
  await page.screenshot({ path: path.join(outDir, "01-landing.png") });

  await page.goto(`${baseUrl}/sign-in`);
  await page.screenshot({ path: path.join(outDir, "02-sign-in.png") });

  await signIn(page, "manager@condopilot.demo");
  await page.screenshot({ path: path.join(outDir, "03-dashboard.png") });

  await page.getByRole("link", { name: "Agente" }).click();
  await page.getByLabel("Mensagem para o agente").fill("Quais moradores estão inadimplentes?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await page.getByText("sucesso").waitFor();
  await page.screenshot({ path: path.join(outDir, "04-agent-delinquency.png") });

  await page
    .getByLabel("Mensagem para o agente")
    .fill("Reserve o salão para Carlos amanhã às 19h.");
  await page.getByRole("button", { name: "Enviar" }).click();
  await page.getByText("aguardando confirmação").waitFor();
  await page.screenshot({ path: path.join(outDir, "05-agent-reservation-confirm.png") });
  await page.getByRole("button", { name: "Confirmar" }).click();
  await page.getByText("Reserva confirmada").waitFor();
  await page.screenshot({ path: path.join(outDir, "06-agent-reservation-booked.png") });

  for (const [route, file] of [
    ["/residents", "07-residents.png"],
    ["/billing", "08-billing.png"],
    ["/reservations", "09-reservations.png"],
    ["/notifications", "10-notifications.png"],
    ["/security", "11-security.png"],
    ["/quality", "12-quality.png"],
  ] as const) {
    await page.goto(`${baseUrl}${route}`);
    await page.screenshot({ path: path.join(outDir, file) });
  }

  await browser.close();
  console.log(`Screenshots saved to ${outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
