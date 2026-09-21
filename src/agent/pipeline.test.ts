import { z } from "zod";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testDb } from "@/test/db";
import type { Actor } from "@/lib/actor";
import { registerTool } from "@/agent/tool-registry";
import { runAgentTurn } from "@/agent/pipeline";

registerTool(
  {
    name: "test-success",
    description: "succeeds",
    minRole: "RESIDENT",
    requiresConfirmation: false,
    inputSchema: z.object({}),
    outputSchema: z.object({ value: z.number() }),
    async execute() {
      return { value: 42 };
    },
    respond(_a, r) {
      return `resultado: ${r.value}`;
    },
  },
  (input) => (input === "trigger-success" ? {} : null),
);

registerTool(
  {
    name: "test-denied",
    description: "manager only",
    minRole: "MANAGER",
    requiresConfirmation: false,
    inputSchema: z.object({}),
    outputSchema: z.object({ ok: z.boolean() }),
    async execute() {
      return { ok: true };
    },
    respond() {
      return "ok";
    },
  },
  (input) => (input === "trigger-denied" ? {} : null),
);

registerTool(
  {
    name: "test-confirm",
    description: "cancela a reserva do salão",
    minRole: "RESIDENT",
    requiresConfirmation: true,
    inputSchema: z.object({ amount: z.number() }),
    outputSchema: z.object({ ok: z.boolean() }),
    async execute(_actor, args) {
      return { ok: args.amount > 0 };
    },
    respond() {
      return "confirmado";
    },
  },
  (input) => (input === "trigger-confirm" ? { amount: 10 } : null),
);

registerTool(
  {
    name: "test-badargs",
    description: "precisa de id",
    minRole: "RESIDENT",
    requiresConfirmation: false,
    inputSchema: z.object({ id: z.string() }),
    outputSchema: z.object({ ok: z.boolean() }),
    async execute() {
      return { ok: true };
    },
    respond() {
      return "ok";
    },
  },
  (input) => (input === "trigger-badargs" ? {} : null),
);

registerTool(
  {
    name: "test-error",
    description: "sempre falha",
    minRole: "RESIDENT",
    requiresConfirmation: false,
    inputSchema: z.object({}),
    outputSchema: z.object({ ok: z.boolean() }),
    async execute() {
      throw new Error("boom");
    },
    respond() {
      return "ok";
    },
  },
  (input) => (input === "trigger-error" ? {} : null),
);

describe("runAgentTurn (integration)", () => {
  let condominiumId: string;
  let actor: Actor;

  beforeAll(async () => {
    const condominium = await testDb.condominium.create({ data: { name: "Pipeline Test Condo" } });
    condominiumId = condominium.id;
    actor = { userId: "pipeline-test-user", condominiumId, role: "RESIDENT" };
  });

  afterAll(async () => {
    await testDb.agentExecution.deleteMany({ where: { condominiumId } });
    await testDb.condominium.delete({ where: { id: condominiumId } });
    await testDb.$disconnect();
  });

  it("executes a matched tool and records a SUCCESS trace", async () => {
    const result = await runAgentTurn(testDb, actor, { input: "trigger-success" });
    expect(result).toMatchObject({
      status: "SUCCESS",
      tool: "test-success",
      result: { value: 42 },
    });

    const trace = await testDb.agentExecution.findFirst({
      where: { condominiumId, toolName: "test-success" },
      orderBy: { createdAt: "desc" },
    });
    expect(trace?.status).toBe("SUCCESS");
  });

  it("denies a tool above the actor's role and records DENIED", async () => {
    const result = await runAgentTurn(testDb, actor, { input: "trigger-denied" });
    expect(result.status).toBe("DENIED");

    const trace = await testDb.agentExecution.findFirst({
      where: { condominiumId, toolName: "test-denied" },
      orderBy: { createdAt: "desc" },
    });
    expect(trace?.status).toBe("DENIED");
  });

  it("returns CLARIFY for unmatched input and does not call a tool", async () => {
    const result = await runAgentTurn(testDb, actor, {
      input: "isso não bate com nada registrado",
    });
    expect(result.status).toBe("CLARIFY");
  });

  it("returns CLARIFY when matched args fail the tool's schema", async () => {
    const result = await runAgentTurn(testDb, actor, { input: "trigger-badargs" });
    expect(result.status).toBe("CLARIFY");
  });

  it("requires confirmation before executing, then executes on the confirmed call", async () => {
    const first = await runAgentTurn(testDb, actor, { input: "trigger-confirm" });
    expect(first).toMatchObject({ status: "PENDING_CONFIRMATION", tool: "test-confirm" });
    if (first.status !== "PENDING_CONFIRMATION") throw new Error("unreachable");

    const second = await runAgentTurn(
      testDb,
      actor,
      { input: "trigger-confirm" },
      { tool: first.tool, args: first.args },
    );
    expect(second).toMatchObject({ status: "SUCCESS", tool: "test-confirm" });
  });

  it("turns a tool exception into a controlled ERROR, never a fabricated success", async () => {
    const result = await runAgentTurn(testDb, actor, { input: "trigger-error" });
    expect(result.status).toBe("ERROR");
  });
});
