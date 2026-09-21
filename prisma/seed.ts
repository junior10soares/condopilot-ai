import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

const DEMO_PASSWORD = "Demo@123";

async function main() {
  const condominium = await db.condominium.upsert({
    where: { id: "demo-condominium" },
    update: {},
    create: {
      id: "demo-condominium",
      name: "Residencial Aurora",
      address: "Rua das Palmeiras, 120",
    },
  });

  const passwordHash = await hash(DEMO_PASSWORD, 10);

  await db.user.upsert({
    where: { email: "manager@condopilot.demo" },
    update: {},
    create: {
      condominiumId: condominium.id,
      name: "Ana Ferreira",
      email: "manager@condopilot.demo",
      passwordHash,
      role: Role.MANAGER,
      unit: "Administração",
    },
  });

  const carlos = await db.user.upsert({
    where: { email: "carlos@condopilot.demo" },
    update: {},
    create: {
      condominiumId: condominium.id,
      name: "Carlos Silva",
      email: "carlos@condopilot.demo",
      passwordHash,
      role: Role.RESIDENT,
      unit: "Apto 302",
    },
  });

  const fernanda = await db.user.upsert({
    where: { email: "fernanda@condopilot.demo" },
    update: {},
    create: {
      condominiumId: condominium.id,
      name: "Fernanda Costa",
      email: "fernanda@condopilot.demo",
      passwordHash,
      role: Role.RESIDENT,
      unit: "Apto 105",
    },
  });

  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  await db.charge.upsert({
    where: { id: "demo-charge-carlos-paid" },
    update: {},
    create: {
      id: "demo-charge-carlos-paid",
      condominiumId: condominium.id,
      userId: carlos.id,
      description: "Taxa condominial — mês anterior",
      amountCents: 55000,
      dueDate: oneMonthAgo,
      paidAt: oneMonthAgo,
    },
  });

  await db.charge.upsert({
    where: { id: "demo-charge-fernanda-overdue-1" },
    update: {},
    create: {
      id: "demo-charge-fernanda-overdue-1",
      condominiumId: condominium.id,
      userId: fernanda.id,
      description: "Taxa condominial em atraso",
      amountCents: 55000,
      dueDate: fortyDaysAgo,
      paidAt: null,
    },
  });

  await db.charge.upsert({
    where: { id: "demo-charge-fernanda-overdue-2" },
    update: {},
    create: {
      id: "demo-charge-fernanda-overdue-2",
      condominiumId: condominium.id,
      userId: fernanda.id,
      description: "Multa por atraso",
      amountCents: 8000,
      dueDate: tenDaysAgo,
      paidAt: null,
    },
  });

  console.log("Seed concluído.");
  console.log(`  manager@condopilot.demo / ${DEMO_PASSWORD}`);
  console.log(`  carlos@condopilot.demo / ${DEMO_PASSWORD}`);
  console.log(`  fernanda@condopilot.demo / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
