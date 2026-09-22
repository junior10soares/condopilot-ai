import type { z } from "zod";
import type { PrismaClient, Role } from "@prisma/client";
import type { Actor } from "@/lib/actor";

/** O mesmo cliente Prisma que o pipeline usa no trace — mantém leituras/escritas da tool e o trace consistentes nos testes. */
export type ToolDeps = { db: PrismaClient };

/** Uma tool lança isso para uma falha de negócio esperada (conflito, não encontrado...) com uma
 * mensagem segura já escrita para o usuário — qualquer outra coisa lançada é tratada como um
 * erro inesperado, com mensagem genérica. */
export class ToolExecutionError extends Error {
  constructor(public readonly userMessage: string) {
    super(userMessage);
    this.name = "ToolExecutionError";
  }
}

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
  /** Resposta em linguagem natural determinística — não precisa de LLM no caminho padrão (grátis). */
  respond: (args: z.infer<InputSchema>, result: z.infer<OutputSchema>) => string;
}

/** Um matcher transforma o texto bruto do usuário nos args desta tool, ou retorna null se não se aplica. */
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
  | { status: "PENDING_CONFIRMATION"; message: string; tool: string; args: unknown }
  | { status: "RATE_LIMITED"; message: string };
