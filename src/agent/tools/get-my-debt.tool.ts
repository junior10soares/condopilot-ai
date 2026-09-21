import { z } from "zod";
import { registerTool } from "@/agent/tool-registry";
import { matchesAny } from "@/agent/match";
import { listChargesForUser } from "@/repositories/charges";

const inputSchema = z.object({});
const outputSchema = z.object({
  openCharges: z.array(
    z.object({ description: z.string(), amountCents: z.number(), dueDate: z.date() }),
  ),
  totalOwedCents: z.number(),
});

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

registerTool(
  {
    name: "getMyDebt",
    description: "Consulta seus próprios débitos",
    minRole: "RESIDENT",
    requiresConfirmation: false,
    inputSchema,
    outputSchema,
    async execute({ db }, actor) {
      // Always self-scoped via the authenticated actor — never from parsed text.
      const charges = await listChargesForUser(db, actor.condominiumId, actor.userId);
      const openCharges = charges.filter((c) => c.paidAt === null && c.dueDate < new Date());
      return {
        openCharges: openCharges.map((c) => ({
          description: c.description,
          amountCents: c.amountCents,
          dueDate: c.dueDate,
        })),
        totalOwedCents: openCharges.reduce((sum, c) => sum + c.amountCents, 0),
      };
    },
    respond(_args, result) {
      if (result.openCharges.length === 0) return "Você não tem débitos em aberto.";
      return `Você tem ${result.openCharges.length} débito(s) em aberto, totalizando ${formatBRL(result.totalOwedCents)}.`;
    },
  },
  (input) =>
    matchesAny(input, ["minha dívida", "minhas dívidas", "eu devo", "meus boletos", "meu débito"])
      ? {}
      : null,
);
