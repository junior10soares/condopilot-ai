import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import type { Actor } from "@/lib/actor";
import { AuthorizationError, requireRole } from "@/lib/authz";
import { getTool } from "@/agent/tool-registry";
import { getModelProvider } from "@/agent/providers";
import { recordExecution } from "@/agent/trace";
import type { AgentTurnResult } from "@/agent/types";
import "@/agent/tools"; // side-effect: registers every business tool

const turnInputSchema = z.object({ input: z.string().min(1).max(2000) });

/** When the caller is resending a previously-pending confirmation. */
export type ConfirmedCall = { tool: string; args: unknown };

export async function runAgentTurn(
  prisma: PrismaClient,
  actor: Actor,
  rawInput: unknown,
  confirmed?: ConfirmedCall,
): Promise<AgentTurnResult> {
  const startedAt = Date.now();
  const parsedTurn = turnInputSchema.safeParse(rawInput);

  if (!parsedTurn.success) {
    return finish({ status: "ERROR", message: "Entrada inválida." });
  }

  const input = parsedTurn.data.input;
  let toolName: string;
  let rawArgs: unknown;

  if (confirmed) {
    toolName = confirmed.tool;
    rawArgs = confirmed.args;
  } else {
    const decision = await getModelProvider().plan(input, actor);
    if (decision.kind === "clarify") {
      return finish({ status: "CLARIFY", message: decision.question });
    }
    toolName = decision.tool;
    rawArgs = decision.args;
  }

  const tool = getTool(toolName);
  if (!tool) {
    return finish(
      { status: "ERROR", message: "Ferramenta desconhecida.", tool: toolName },
      toolName,
    );
  }

  try {
    requireRole(actor, tool.minRole);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return finish(
        {
          status: "DENIED",
          message: "Você não tem permissão para executar essa ação.",
          tool: toolName,
        },
        toolName,
        rawArgs,
        "DENIED",
      );
    }
    throw error;
  }

  const parsedArgs = tool.inputSchema.safeParse(rawArgs);
  if (!parsedArgs.success) {
    return finish(
      { status: "CLARIFY", message: "Preciso de mais informações para continuar com esse pedido." },
      toolName,
      rawArgs,
    );
  }

  if (tool.requiresConfirmation && !confirmed) {
    return finish(
      {
        status: "PENDING_CONFIRMATION",
        message: `Confirma esta ação: ${tool.description}?`,
        tool: toolName,
        args: parsedArgs.data,
      },
      toolName,
      parsedArgs.data,
      "PENDING_CONFIRMATION",
    );
  }

  try {
    const rawResult = await tool.execute({ db: prisma }, actor, parsedArgs.data);
    const result = tool.outputSchema.parse(rawResult);
    return finish(
      { status: "SUCCESS", message: tool.respond(parsedArgs.data, result), tool: toolName, result },
      toolName,
      parsedArgs.data,
      "SUCCESS",
    );
  } catch {
    // Tool failures never surface as a fabricated success — see docs/agent-contract.md.
    return finish(
      {
        status: "ERROR",
        message: "Não consegui concluir essa ação agora. Tente novamente em instantes.",
        tool: toolName,
      },
      toolName,
      parsedArgs.data,
      "ERROR",
    );
  }

  async function finish(
    result: AgentTurnResult,
    tracedTool: string | null = null,
    tracedArgs: unknown = undefined,
    statusOverride?: AgentTurnResult["status"],
  ): Promise<AgentTurnResult> {
    await recordExecution(prisma, {
      actor,
      input,
      toolName: tracedTool,
      toolArgs: tracedArgs,
      status: statusOverride ?? result.status,
      latencyMs: Date.now() - startedAt,
    });
    return result;
  }
}
