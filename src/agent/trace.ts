import type { AgentTurnStatus, PrismaClient } from "@prisma/client";
import type { Actor } from "@/lib/actor";

export async function recordExecution(
  prisma: PrismaClient,
  params: {
    actor: Actor;
    input: string;
    toolName: string | null;
    toolArgs: unknown;
    status: AgentTurnStatus;
    errorCode?: string;
    latencyMs: number;
  },
) {
  await prisma.agentExecution.create({
    data: {
      condominiumId: params.actor.condominiumId,
      userId: params.actor.userId,
      // Limite do trace: nunca guarda mais que um trecho fixo do texto original.
      input: params.input.slice(0, 2000),
      toolName: params.toolName,
      // toolArgs já passou pela validação do zod — são dados de negócio (ids, datas, nomes),
      // nunca segredos.
      toolArgs:
        params.toolArgs === undefined ? undefined : JSON.parse(JSON.stringify(params.toolArgs)),
      status: params.status,
      errorCode: params.errorCode,
      latencyMs: params.latencyMs,
    },
  });
}
