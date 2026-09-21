import { z } from "zod";
import { registerTool } from "@/agent/tool-registry";
import { listUsersForCondominium } from "@/repositories/users";
import { presentResidentsForActor } from "@/lib/privacy";

const inputSchema = z.object({});
const outputSchema = z.object({
  residents: z.array(z.object({ name: z.string(), unit: z.string().nullable(), role: z.string() })),
});

registerTool(
  {
    name: "listResidents",
    description: "Lista os moradores do condomínio",
    minRole: "RESIDENT",
    requiresConfirmation: false,
    inputSchema,
    outputSchema,
    async execute({ db }, actor) {
      const residents = presentResidentsForActor(
        actor,
        await listUsersForCondominium(db, actor.condominiumId),
      );
      return { residents: residents.map((r) => ({ name: r.name, unit: r.unit, role: r.role })) };
    },
    respond(_args, result) {
      if (result.residents.length === 0) return "Não há moradores cadastrados neste condomínio.";
      const list = result.residents.map((r) => `${r.name} (${r.unit ?? "sem unidade"})`).join(", ");
      return `Encontrei ${result.residents.length} morador(es): ${list}.`;
    },
  },
  (input) => {
    const normalized = input.toLowerCase();
    if (/\b(quem mora|lista de moradores|moradores do cond|listar moradores)\b/.test(normalized))
      return {};
    return null;
  },
);
