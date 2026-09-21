"use server";

import { requireActor } from "@/lib/actor";
import { db } from "@/lib/db";
import { runAgentTurn, type ConfirmedCall } from "@/agent/pipeline";
import type { AgentTurnResult } from "@/agent/types";

export async function sendAgentMessage(
  input: string,
  confirmed?: ConfirmedCall,
): Promise<AgentTurnResult> {
  const actor = await requireActor();
  return runAgentTurn(db, actor, { input }, confirmed);
}
