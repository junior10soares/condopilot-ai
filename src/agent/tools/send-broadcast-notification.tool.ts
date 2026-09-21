import { z } from "zod";
import { registerTool } from "@/agent/tool-registry";
import { broadcastNotification } from "@/repositories/notifications";

const inputSchema = z.object({ body: z.string().min(1).max(500) });
const outputSchema = z.object({ recipientCount: z.number() });

const TRIGGER = /(?:notificar|avisar)\s+(?:os\s+)?moradores(?:\s+sobre|\s+que|:)?\s+(.+)/i;

registerTool(
  {
    name: "sendBroadcastNotification",
    description: "Envia um aviso simulado para todos os moradores",
    // Bulk operation with side effects across every resident — management only.
    minRole: "MANAGER",
    requiresConfirmation: true,
    inputSchema,
    outputSchema,
    async execute({ db }, actor, args) {
      const { recipientCount } = await broadcastNotification(db, {
        condominiumId: actor.condominiumId,
        sentByUserId: actor.userId,
        subject: "Aviso do condomínio",
        body: args.body,
      });
      return { recipientCount };
    },
    respond(args, result) {
      return `Aviso simulado enviado para ${result.recipientCount} morador(es): "${args.body}".`;
    },
  },
  (input) => {
    const match = input.match(TRIGGER);
    const body = match?.[1]?.trim();
    return body ? { body } : null;
  },
);
