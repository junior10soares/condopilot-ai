import { z } from "zod";
import { registerTool } from "@/agent/tool-registry";
import { matchesAny } from "@/agent/match";
import { listResidentsInDebt } from "@/repositories/charges";

const inputSchema = z.object({});
const outputSchema = z.object({
  residents: z.array(
    z.object({ name: z.string(), unit: z.string().nullable(), totalOwedCents: z.number() }),
  ),
});

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

registerTool(
  {
    name: "getResidentsInDebt",
    description: "Lista moradores inadimplentes (visão gerencial)",
    // Financial visibility rule: only management can see who ELSE owes money.
    minRole: "MANAGER",
    requiresConfirmation: false,
    inputSchema,
    outputSchema,
    async execute({ db }, actor) {
      const residents = await listResidentsInDebt(db, actor.condominiumId);
      return {
        residents: residents.map((r) => ({
          name: r.name,
          unit: r.unit,
          totalOwedCents: r.totalOwedCents,
        })),
      };
    },
    respond(_args, result) {
      if (result.residents.length === 0) return "Nenhum morador está inadimplente no momento.";
      const list = result.residents
        .map((r) => `${r.name} (${r.unit ?? "sem unidade"}): ${formatBRL(r.totalOwedCents)}`)
        .join("; ");
      return `${result.residents.length} morador(es) inadimplente(s): ${list}.`;
    },
  },
  (input) =>
    matchesAny(input, ["inadimplent", "devendo", "em atraso", "atraso no pagamento"]) ? {} : null,
);
