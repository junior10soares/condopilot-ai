/**
 * Automated walkthrough recording following docs/demo-script.md, driven against a real running
 * instance — no narration (nothing here can add voice-over), but every screen and interaction is
 * the real app, not a mockup. Not a test — nothing to assert.
 *
 * Run against a live instance: npm run start (or dev), then:
 *   npx tsx scripts/record-demo.ts [baseUrl]
 * Saves docs/demo-video/demo.mp4 (falls back to .webm if ffmpeg isn't installed).
 */
import { mkdir, readdir, rename, unlink } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { chromium } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const execFileAsync = promisify(execFile);

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const outDir = path.resolve(__dirname, "../docs/demo-video");

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await mkdir(outDir, { recursive: true });

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
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: outDir, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();

  // Scene 1 — Hook
  await page.goto(baseUrl);
  await pause(2000);

  // Scene 2 — Agent request (delinquency)
  await page.getByRole("link", { name: "Entrar", exact: true }).click();
  await page.getByLabel("Email").fill("manager@condopilot.demo");
  await page.getByLabel("Senha").fill("Demo@123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL(/\/dashboard/);
  await pause(800);

  await page.getByRole("link", { name: "Agente" }).click();
  await page.getByLabel("Mensagem para o agente").fill("Quais moradores estão inadimplentes?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await page.getByText("sucesso").waitFor();
  await pause(2000);

  // Scene 3 — Reservation with confirmation
  await page
    .getByLabel("Mensagem para o agente")
    .fill("Reserve o salão para Carlos amanhã às 19h.");
  await page.getByRole("button", { name: "Enviar" }).click();
  await page.getByText("aguardando confirmação").waitFor();
  await pause(1500);
  await page.getByRole("button", { name: "Confirmar" }).click();
  await page.getByText("Reserva confirmada").waitFor();
  await pause(2000);

  // Scene 4/5 — Observability + Security
  await page.getByRole("link", { name: "Segurança" }).click();
  await pause(2000);

  // Scene 6 (adapted) — Quality Center in place of a terminal/CI capture
  await page.getByRole("link", { name: "Qualidade" }).click();
  await pause(2500);

  // Scene 7 — everyday screens, for context
  await page.getByRole("link", { name: "Moradores" }).click();
  await pause(1200);
  await page.getByRole("link", { name: "Reservas" }).click();
  await pause(1500);

  await context.close();
  await browser.close();

  // Playwright names the file by an internal id — rename to something predictable.
  const files = await readdir(outDir);
  const generated = files.find((f) => f.endsWith(".webm"));
  if (!generated) throw new Error("Playwright did not produce a .webm recording.");
  const webmPath = path.join(outDir, "demo.webm");
  await rename(path.join(outDir, generated), webmPath);

  const mp4Path = path.join(outDir, "demo.mp4");
  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      webmPath,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "23",
      "-preset",
      "medium",
      "-movflags",
      "+faststart",
      mp4Path,
    ]);
    await unlink(webmPath);
    console.log(`Demo video saved to ${mp4Path}`);
  } catch {
    console.log(`ffmpeg not available — demo video saved to ${webmPath} (not converted to mp4).`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
