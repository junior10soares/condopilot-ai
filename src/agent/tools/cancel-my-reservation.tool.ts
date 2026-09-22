import { z } from "zod";
import { registerTool } from "@/agent/tool-registry";
import { matchesAny } from "@/agent/match";
import { ToolExecutionError } from "@/agent/types";
import { cancelReservation } from "@/repositories/reservations";

const inputSchema = z.object({ commonAreaName: z.string() });
const outputSchema = z.object({ cancelled: z.boolean() });

registerTool(
  {
    name: "cancelMyReservation",
    description: "Cancela sua próxima reserva confirmada do Salão de Festas",
    minRole: "RESIDENT",
    // Cancelamento afeta a própria reserva do morador, mas ainda é consequente — confirma antes.
    requiresConfirmation: true,
    inputSchema,
    outputSchema,
    async execute({ db }, actor, args) {
      const commonArea = await db.commonArea.findFirst({
        where: { condominiumId: actor.condominiumId, name: args.commonAreaName },
      });
      if (!commonArea) throw new ToolExecutionError("Não encontrei essa área comum no condomínio.");

      // Escopo restrito ao próprio ator: só a próxima reserva confirmada dele mesmo.
      const next = await db.reservation.findFirst({
        where: {
          condominiumId: actor.condominiumId,
          commonAreaId: commonArea.id,
          userId: actor.userId,
          status: "CONFIRMED",
          startsAt: { gt: new Date() },
        },
        orderBy: { startsAt: "asc" },
      });
      if (!next) throw new ToolExecutionError("Você não tem nenhuma reserva futura para cancelar.");

      const cancelled = await cancelReservation(db, actor.condominiumId, next.id);
      return { cancelled };
    },
    respond(_args, result) {
      return result.cancelled
        ? "Sua reserva foi cancelada."
        : "Não foi possível cancelar a reserva.";
    },
  },
  (input) =>
    matchesAny(input, [
      "cancelar minha reserva",
      "cancele minha reserva",
      "cancelar a reserva do salão",
    ])
      ? { commonAreaName: "Salão de Festas" }
      : null,
);
