import { hash } from "bcryptjs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testDb } from "@/test/db";
import type { Actor } from "@/lib/actor";
import { runAgentTurn } from "@/agent/pipeline";

describe("listResidents tool (integration)", () => {
  let condominiumId: string;
  let residentActor: Actor;
  let managerActor: Actor;

  beforeAll(async () => {
    const condominium = await testDb.condominium.create({
      data: { name: "List Residents Test Condo" },
    });
    condominiumId = condominium.id;
    const passwordHash = await hash("x", 4);

    const resident = await testDb.user.create({
      data: {
        condominiumId,
        name: "Resident One",
        email: "resident-one@test.local",
        passwordHash,
        role: "RESIDENT",
        unit: "101",
      },
    });
    const manager = await testDb.user.create({
      data: {
        condominiumId,
        name: "Manager One",
        email: "manager-one@test.local",
        passwordHash,
        role: "MANAGER",
        unit: "Admin",
      },
    });

    residentActor = { userId: resident.id, condominiumId, role: "RESIDENT" };
    managerActor = { userId: manager.id, condominiumId, role: "MANAGER" };
  });

  afterAll(async () => {
    await testDb.user.deleteMany({ where: { condominiumId } });
    await testDb.condominium.delete({ where: { id: condominiumId } });
    await testDb.$disconnect();
  });

  it("resolves the resident-directory phrase to the listResidents tool", async () => {
    const result = await runAgentTurn(testDb, residentActor, { input: "quem mora no condomínio" });
    expect(result.status).toBe("SUCCESS");
    if (result.status !== "SUCCESS") throw new Error("unreachable");
    expect(result.tool).toBe("listResidents");
    expect(result.message).toContain("Resident One");
  });

  it("returns the same tenant-scoped data for a manager actor", async () => {
    const result = await runAgentTurn(testDb, managerActor, { input: "lista de moradores" });
    expect(result.status).toBe("SUCCESS");
    if (result.status !== "SUCCESS") throw new Error("unreachable");
    const residents = (result.result as { residents: { name: string }[] }).residents;
    expect(residents.map((r) => r.name)).toEqual(
      expect.arrayContaining(["Resident One", "Manager One"]),
    );
  });
});
