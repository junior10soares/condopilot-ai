import { hash } from "bcryptjs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testDb } from "@/test/db";
import type { Actor } from "@/lib/actor";
import { runAgentTurn } from "@/agent/pipeline";

describe("reservation tools (integration)", () => {
  let condominiumId: string;
  let actor: Actor;

  beforeAll(async () => {
    const condominium = await testDb.condominium.create({
      data: { name: "Reservation Tool Test Condo" },
    });
    condominiumId = condominium.id;
    await testDb.commonArea.create({
      data: { condominiumId, name: "Salão de Festas" },
    });
    const passwordHash = await hash("x", 4);
    const user = await testDb.user.create({
      data: {
        condominiumId,
        name: "Carlos",
        email: "reservation-tool-test@test.local",
        passwordHash,
        role: "RESIDENT",
      },
    });
    actor = { userId: user.id, condominiumId, role: "RESIDENT" };
  });

  afterAll(async () => {
    await testDb.reservation.deleteMany({ where: { condominiumId } });
    await testDb.commonArea.deleteMany({ where: { condominiumId } });
    await testDb.user.deleteMany({ where: { condominiumId } });
    await testDb.condominium.delete({ where: { id: condominiumId } });
    await testDb.$disconnect();
  });

  it("resolves the exact HERO.md demo phrase and requires confirmation before booking", async () => {
    const first = await runAgentTurn(testDb, actor, {
      input: "Reserve o salão para Carlos amanhã às 19h.",
    });
    expect(first.status).toBe("PENDING_CONFIRMATION");
    if (first.status !== "PENDING_CONFIRMATION") throw new Error("unreachable");
    expect(first.tool).toBe("createReservation");

    // Nothing was booked yet.
    expect(await testDb.reservation.count({ where: { condominiumId } })).toBe(0);

    const confirmed = await runAgentTurn(
      testDb,
      actor,
      { input: "Reserve o salão para Carlos amanhã às 19h." },
      { tool: first.tool, args: first.args },
    );
    expect(confirmed.status).toBe("SUCCESS");
    expect(await testDb.reservation.count({ where: { condominiumId } })).toBe(1);
  });

  it("asks for clarification instead of guessing when the time is missing", async () => {
    const result = await runAgentTurn(testDb, actor, { input: "quero reservar o salão" });
    expect(result.status).toBe("CLARIFY");
  });

  it("checks availability without creating a reservation", async () => {
    const result = await runAgentTurn(testDb, actor, {
      input: "o salão está disponível amanhã às 10h?",
    });
    expect(result.status).toBe("SUCCESS");
    if (result.status !== "SUCCESS") throw new Error("unreachable");
    expect(result.tool).toBe("checkReservationAvailability");
  });

  it("cancels only the actor's own upcoming reservation, with confirmation", async () => {
    const book = await runAgentTurn(testDb, actor, { input: "reservar o salão amanhã às 9h" });
    if (book.status !== "PENDING_CONFIRMATION") throw new Error("unreachable");
    await runAgentTurn(testDb, actor, { input: "confirmar" }, { tool: book.tool, args: book.args });

    const pendingCancel = await runAgentTurn(testDb, actor, {
      input: "cancelar minha reserva do salão",
    });
    expect(pendingCancel.status).toBe("PENDING_CONFIRMATION");
    if (pendingCancel.status !== "PENDING_CONFIRMATION") throw new Error("unreachable");

    const cancelled = await runAgentTurn(
      testDb,
      actor,
      { input: "cancelar minha reserva do salão" },
      { tool: pendingCancel.tool, args: pendingCancel.args },
    );
    expect(cancelled.status).toBe("SUCCESS");
  });
});
