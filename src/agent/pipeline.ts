import { z } from "zod";
import type { PrismaClient } from "@prisma/client";
import type { Actor } from "@/lib/actor";
import { AuthorizationError, requireRole } from "@/lib/authz";
import { getTool } from "@/agent/tool-registry";
import { getModelProvider } from "@/agent/providers";
import { recordExecution } from "@/agent/trace";
import { ToolExecutionError, type AgentTurnResult } from "@/agent/types";
import { checkRateLimit } from "@/lib/rate-limit";
import "@/agent/tools"; // efeito colateral: registra todas as tools de negócio

const turnInputSchema = z.object({ input: z.string().min(1).max(2000) });

const RATE_LIMIT_TURNS = 20;
const RATE_LIMIT_WINDOW_MS = 10_000;

/** Quando o cliente está reenviando uma confirmação pendente. */
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

  if (!checkRateLimit(actor.userId, RATE_LIMIT_TURNS, RATE_LIMIT_WINDOW_MS)) {
    return finish(
      {
        status: "RATE_LIMITED",
        message: "Muitas solicitações em pouco tempo. Aguarde alguns segundos e tente de novo.",
      },
      null,
      undefined,
      "RATE_LIMITED",
    );
  }

  let toolName: string;
  let rawArgs: unknown;

  if (confirmed) {
    toolName = confirmed.tool;
    rawArgs = confirmed.args;
  } else {
    let decision;
    try {
      decision = await getModelProvider().plan(input, actor);
    } catch {
      // Provedores remotos (LLM_PROVIDER=openai-compatible) podem falhar por rede/limite de
      // taxa/chave inválida — nunca deixa isso subir como erro 500 genérico do Next.js.
      return finish({
        status: "ERROR",
        message: "Não consegui planejar essa ação agora. Tente novamente em instantes.",
      });
    }
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
  } catch (error) {
    // Falha de tool nunca vira sucesso fabricado — ver docs/agent-contract.md.
    const message =
      error instanceof ToolExecutionError
        ? error.userMessage
        : "Não consegui concluir essa ação agora. Tente novamente em instantes.";
    return finish({ status: "ERROR", message, tool: toolName }, toolName, parsedArgs.data, "ERROR");
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
