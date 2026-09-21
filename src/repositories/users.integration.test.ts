import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hash } from "bcryptjs";
import { testDb } from "@/test/db";
import { findUserInCondominium, listUsersForCondominium } from "@/repositories/users";
import { verifyCredentials } from "@/lib/credentials";

describe("tenant isolation (integration)", () => {
  let condoA: { id: string };
  let condoB: { id: string };
  let userA: { id: string; email: string };

  beforeAll(async () => {
    condoA = await testDb.condominium.create({ data: { name: "Condo A" } });
    condoB = await testDb.condominium.create({ data: { name: "Condo B" } });

    const passwordHash = await hash("Demo@123", 4);
    userA = await testDb.user.create({
      data: {
        condominiumId: condoA.id,
        name: "Resident A",
        email: `resident-a-${Date.now()}@test.local`,
        passwordHash,
        role: "RESIDENT",
      },
    });
  });

  afterAll(async () => {
    await testDb.user.deleteMany({ where: { condominiumId: { in: [condoA.id, condoB.id] } } });
    await testDb.condominium.deleteMany({ where: { id: { in: [condoA.id, condoB.id] } } });
    await testDb.$disconnect();
  });

  it("returns the user when queried within their own condominium", async () => {
    const found = await findUserInCondominium(testDb, condoA.id, userA.id);
    expect(found?.id).toBe(userA.id);
  });

  it("does not return the user when queried from another condominium", async () => {
    const found = await findUserInCondominium(testDb, condoB.id, userA.id);
    expect(found).toBeNull();
  });

  it("only lists users belonging to the requested condominium", async () => {
    const listA = await listUsersForCondominium(testDb, condoA.id);
    const listB = await listUsersForCondominium(testDb, condoB.id);
    expect(listA.map((u) => u.id)).toContain(userA.id);
    expect(listB.map((u) => u.id)).not.toContain(userA.id);
  });

  it("verifies correct credentials and rejects wrong ones", async () => {
    const ok = await verifyCredentials(testDb, userA.email, "Demo@123");
    expect(ok?.id).toBe(userA.id);

    const badPassword = await verifyCredentials(testDb, userA.email, "wrong-password");
    expect(badPassword).toBeNull();

    const unknownEmail = await verifyCredentials(testDb, "nobody@test.local", "Demo@123");
    expect(unknownEmail).toBeNull();
  });
});
