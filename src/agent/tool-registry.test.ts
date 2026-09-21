import { z } from "zod";
import { beforeEach, describe, expect, it } from "vitest";
import { __resetRegistryForTests, getTool, listTools, registerTool } from "./tool-registry";
import type { Tool } from "./types";

function fakeTool(name: string): Tool {
  return {
    name,
    description: "fake",
    minRole: "RESIDENT",
    requiresConfirmation: false,
    inputSchema: z.object({}),
    outputSchema: z.object({ ok: z.boolean() }),
    async execute() {
      return { ok: true };
    },
    respond() {
      return "ok";
    },
  };
}

describe("tool-registry", () => {
  beforeEach(() => {
    __resetRegistryForTests();
  });

  it("registers and retrieves a tool by name", () => {
    registerTool(fakeTool("alpha"), () => null);
    expect(getTool("alpha")?.name).toBe("alpha");
    expect(listTools()).toHaveLength(1);
  });

  it("rejects registering the same tool name twice", () => {
    registerTool(fakeTool("dup"), () => null);
    expect(() => registerTool(fakeTool("dup"), () => null)).toThrow(/already registered/);
  });

  it("returns undefined for an unknown tool", () => {
    expect(getTool("missing")).toBeUndefined();
  });
});
