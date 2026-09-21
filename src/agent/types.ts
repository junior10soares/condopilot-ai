import type { z } from "zod";
import type { PrismaClient, Role } from "@prisma/client";
import type { Actor } from "@/lib/actor";

/** Same Prisma client the pipeline is tracing to — keeps tool reads/writes and the trace consistent in tests. */
export type ToolDeps = { db: PrismaClient };

export interface Tool<
  InputSchema extends z.ZodTypeAny = z.ZodTypeAny,
  OutputSchema extends z.ZodTypeAny = z.ZodTypeAny,
> {
  name: string;
  description: string;
  minRole: Role;
  requiresConfirmation: boolean;
  inputSchema: InputSchema;
  outputSchema: OutputSchema;
  execute: (
    deps: ToolDeps,
    actor: Actor,
    args: z.infer<InputSchema>,
  ) => Promise<z.infer<OutputSchema>>;
  /** Deterministic natural-language response — no LLM needed in the default (free) path. */
  respond: (args: z.infer<InputSchema>, result: z.infer<OutputSchema>) => string;
}

/** A matcher turns raw user text into this tool's args, or returns null if it doesn't apply. */
export type ToolMatcher = (input: string) => Record<string, unknown> | null;

export type PlannerDecision =
  { kind: "tool"; tool: string; args: unknown } | { kind: "clarify"; question: string };

export interface ModelProvider {
  name: string;
  plan: (input: string, actor: Actor) => Promise<PlannerDecision>;
}

export type AgentTurnResult =
  | { status: "SUCCESS"; message: string; tool: string; result: unknown }
  | { status: "DENIED"; message: string; tool: string }
  | { status: "CLARIFY"; message: string }
  | { status: "ERROR"; message: string; tool?: string }
  | { status: "PENDING_CONFIRMATION"; message: string; tool: string; args: unknown };
