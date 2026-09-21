import { z } from "zod";
import { registerTool } from "@/agent/tool-registry";
import { matchesAny } from "@/agent/match";

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
  (input) => (matchesAny(input, ["ping", "está aí", "esta ai"]) ? {} : null),
);
