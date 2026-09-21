import { z } from "zod";
import { registerTool } from "@/agent/tool-registry";

const inputSchema = z.object({});
const outputSchema = z.object({ condominiumName: z.string() });

registerTool(
  {
    name: "ping",
    description: "Verifica a conexão do agente com o condomínio",
    minRole: "RESIDENT",
    requiresConfirmation: false,
    inputSchema,
    outputSchema,
    async execute({ db }, actor) {
      const condominium = await db.condominium.findUniqueOrThrow({
        where: { id: actor.condominiumId },
      });
      return { condominiumName: condominium.name };
    },
    respond(_args, result) {
      return `Tudo certo! Estou conectado ao ${result.condominiumName}.`;
    },
  },
  (input) => {
    const normalized = input.toLowerCase();
    if (/\b(ping|está (a[ií])|esta (a[ií]))\b/.test(normalized)) return {};
    return null;
  },
);
