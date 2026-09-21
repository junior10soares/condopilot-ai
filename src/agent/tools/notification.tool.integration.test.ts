import { hash } from "bcryptjs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testDb } from "@/test/db";
import type { Actor } from "@/lib/actor";
import { runAgentTurn } from "@/agent/pipeline";

describe("sendBroadcastNotification tool (integration)", () => {
  let condominiumId: string;
  let managerActor: Actor;
  let residentActor: Actor;
  let otherResidentId: string;

  beforeAll(async () => {
    const condominium = await testDb.condominium.create({
      data: { name: "Notification Test Condo" },
    });
    condominiumId = condominium.id;
    const passwordHash = await hash("x", 4);

    const manager = await testDb.user.create({
      data: {
        condominiumId,
        name: "Manager",
        email: "notif-manager@test.local",
        passwordHash,
        role: "MANAGER",
      },
    });
    const resident = await testDb.user.create({
      data: {
        condominiumId,
        name: "Resident",
        email: "notif-resident@test.local",
        passwordHash,
        role: "RESIDENT",
      },
    });
    const other = await testDb.user.create({
      data: {
        condominiumId,
        name: "Other",
        email: "notif-other@test.local",
        passwordHash,
        role: "RESIDENT",
      },
    });

    managerActor = { userId: manager.id, condominiumId, role: "MANAGER" };
    residentActor = { userId: resident.id, condominiumId, role: "RESIDENT" };
    otherResidentId = other.id;
  });

  afterAll(async () => {
    await testDb.notification.deleteMany({ where: { condominiumId } });
    await testDb.user.deleteMany({ where: { condominiumId } });
    await testDb.condominium.delete({ where: { id: condominiumId } });
    await testDb.$disconnect();
  });

  it("denies a resident broadcasting, and traces the denial", async () => {
    const result = await runAgentTurn(testDb, residentActor, {
      input: "avisar os moradores sobre a reunião",
    });
    expect(result.status).toBe("DENIED");

    const trace = await testDb.agentExecution.findFirst({
      where: { condominiumId, userId: residentActor.userId, toolName: "sendBroadcastNotification" },
      orderBy: { createdAt: "desc" },
    });
    expect(trace?.status).toBe("DENIED");
  });

  it("asks for clarification instead of sending an empty/guessed message", async () => {
    const result = await runAgentTurn(testDb, managerActor, { input: "avisar os moradores" });
    expect(result.status).toBe("CLARIFY");
  });

  it("requires confirmation, then broadcasts to every resident with an audit trail", async () => {
    const first = await runAgentTurn(testDb, managerActor, {
      input: "avisar os moradores sobre a reunião de síndico amanhã",
    });
    expect(first.status).toBe("PENDING_CONFIRMATION");
    if (first.status !== "PENDING_CONFIRMATION") throw new Error("unreachable");

    const confirmed = await runAgentTurn(
      testDb,
      managerActor,
      { input: "confirmar" },
      { tool: first.tool, args: first.args },
    );
    expect(confirmed.status).toBe("SUCCESS");
    if (confirmed.status !== "SUCCESS") throw new Error("unreachable");
    expect((confirmed.result as { recipientCount: number }).recipientCount).toBe(2);

    const notifications = await testDb.notification.findMany({ where: { condominiumId } });
    expect(notifications).toHaveLength(2);
    expect(notifications.every((n) => n.sentByUserId === managerActor.userId)).toBe(true);
    expect(notifications.map((n) => n.recipientUserId).sort()).toEqual(
      [residentActor.userId, otherResidentId].sort(),
    );
  });
});
