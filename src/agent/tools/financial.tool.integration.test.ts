import { hash } from "bcryptjs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testDb } from "@/test/db";
import type { Actor } from "@/lib/actor";
import { runAgentTurn } from "@/agent/pipeline";

describe("financial tools (integration)", () => {
  let condominiumId: string;
  let managerActor: Actor;
  let residentActor: Actor; // has an overdue charge
  let otherResidentActor: Actor; // fully paid up

  beforeAll(async () => {
    const condominium = await testDb.condominium.create({ data: { name: "Financial Test Condo" } });
    condominiumId = condominium.id;
    const passwordHash = await hash("x", 4);

    const manager = await testDb.user.create({
      data: {
        condominiumId,
        name: "Manager",
        email: "fin-manager@test.local",
        passwordHash,
        role: "MANAGER",
      },
    });
    const debtor = await testDb.user.create({
      data: {
        condominiumId,
        name: "Debtor",
        email: "fin-debtor@test.local",
        passwordHash,
        role: "RESIDENT",
        unit: "9",
      },
    });
    const payer = await testDb.user.create({
      data: {
        condominiumId,
        name: "Payer",
        email: "fin-payer@test.local",
        passwordHash,
        role: "RESIDENT",
      },
    });

    await testDb.charge.create({
      data: {
        condominiumId,
        userId: debtor.id,
        description: "Taxa em atraso",
        amountCents: 10000,
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        paidAt: null,
      },
    });
    await testDb.charge.create({
      data: {
        condominiumId,
        userId: payer.id,
        description: "Taxa paga",
        amountCents: 10000,
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        paidAt: new Date(),
      },
    });

    managerActor = { userId: manager.id, condominiumId, role: "MANAGER" };
    residentActor = { userId: debtor.id, condominiumId, role: "RESIDENT" };
    otherResidentActor = { userId: payer.id, condominiumId, role: "RESIDENT" };
  });

  afterAll(async () => {
    await testDb.charge.deleteMany({ where: { condominiumId } });
    await testDb.user.deleteMany({ where: { condominiumId } });
    await testDb.condominium.delete({ where: { id: condominiumId } });
    await testDb.$disconnect();
  });

  it("resolves the exact HERO.md demo phrase to getResidentsInDebt for a manager", async () => {
    const result = await runAgentTurn(testDb, managerActor, {
      input: "Quais moradores estão inadimplentes?",
    });
    expect(result.status).toBe("SUCCESS");
    if (result.status !== "SUCCESS") throw new Error("unreachable");
    expect(result.tool).toBe("getResidentsInDebt");
    expect(result.message).toContain("Debtor");
    expect(result.message).not.toContain("Payer");
  });

  it("denies a resident asking who else is delinquent, and traces the denial", async () => {
    const result = await runAgentTurn(testDb, residentActor, {
      input: "quais moradores estão inadimplentes",
    });
    expect(result.status).toBe("DENIED");

    const trace = await testDb.agentExecution.findFirst({
      where: { condominiumId, userId: residentActor.userId, toolName: "getResidentsInDebt" },
      orderBy: { createdAt: "desc" },
    });
    expect(trace?.status).toBe("DENIED");
  });

  it("scopes getMyDebt to the authenticated actor, never to parsed text", async () => {
    const debtorResult = await runAgentTurn(testDb, residentActor, {
      input: "quanto eu devo? minha dívida",
    });
    expect(debtorResult.status).toBe("SUCCESS");
    if (debtorResult.status !== "SUCCESS") throw new Error("unreachable");
    expect((debtorResult.result as { totalOwedCents: number }).totalOwedCents).toBe(10000);

    const payerResult = await runAgentTurn(testDb, otherResidentActor, { input: "minha dívida" });
    expect(payerResult.status).toBe("SUCCESS");
    if (payerResult.status !== "SUCCESS") throw new Error("unreachable");
    expect((payerResult.result as { totalOwedCents: number }).totalOwedCents).toBe(0);
  });
});
