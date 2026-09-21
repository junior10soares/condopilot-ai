import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testDb } from "@/test/db";
import type { Actor } from "@/lib/actor";
import { runAgentTurn } from "@/agent/pipeline";
import { __resetRateLimitForTests } from "@/lib/rate-limit";

describe("rate limiting (integration)", () => {
  let condominiumId: string;
  let actor: Actor;

  beforeAll(async () => {
    const condominium = await testDb.condominium.create({
      data: { name: "Rate Limit Test Condo" },
    });
    condominiumId = condominium.id;
    // A dedicated, never-reused actor id so this test's own request volume can't affect (or be
    // affected by) any other test file sharing the in-memory rate limiter.
    actor = { userId: "rate-limit-test-actor", condominiumId, role: "RESIDENT" };
    __resetRateLimitForTests();
  });

  afterAll(async () => {
    __resetRateLimitForTests();
    await testDb.agentExecution.deleteMany({ where: { condominiumId } });
    await testDb.condominium.delete({ where: { id: condominiumId } });
    await testDb.$disconnect();
  });

  it("trips after the configured number of turns and traces it", async () => {
    let lastResult;
    for (let i = 0; i < 21; i++) {
      lastResult = await runAgentTurn(testDb, actor, { input: "ping" });
    }

    expect(lastResult?.status).toBe("RATE_LIMITED");

    const trace = await testDb.agentExecution.findFirst({
      where: { condominiumId, userId: actor.userId, status: "RATE_LIMITED" },
    });
    expect(trace).not.toBeNull();
  });
});
