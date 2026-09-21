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

  await db.user.upsert({
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

  console.log("Seed concluído.");
  console.log(`  manager@condopilot.demo / ${DEMO_PASSWORD}`);
  console.log(`  carlos@condopilot.demo / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
