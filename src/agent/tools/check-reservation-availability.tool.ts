import { z } from "zod";
import { registerTool } from "@/agent/tool-registry";
import { matchesAny } from "@/agent/match";
import { ToolExecutionError } from "@/agent/types";
import { isAvailable } from "@/repositories/reservations";
import { parseReservationTime } from "./reservation-time-parser";

const inputSchema = z.object({
  commonAreaName: z.string(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
});
const outputSchema = z.object({ available: z.boolean() });

registerTool(
  {
    name: "checkReservationAvailability",
    description: "Verifica disponibilidade do Salão de Festas",
    minRole: "RESIDENT",
    requiresConfirmation: false,
    inputSchema,
    outputSchema,
    async execute({ db }, actor, args) {
      const commonArea = await db.commonArea.findFirst({
        where: { condominiumId: actor.condominiumId, name: args.commonAreaName },
      });
      if (!commonArea) throw new ToolExecutionError("Não encontrei essa área comum no condomínio.");

      const available = await isAvailable(
        db,
        actor.condominiumId,
        commonArea.id,
        args.startsAt,
        args.endsAt,
      );
      return { available };
    },
    respond(_args, result) {
      return result.available
        ? "O Salão de Festas está disponível nesse horário."
        : "O Salão de Festas já está reservado nesse horário.";
    },
  },
  (input) => {
    if (!matchesAny(input, ["salão", "salao"])) return null;
    if (!matchesAny(input, ["dispon", "livre", "posso reservar"])) return null;
    const parsed = parseReservationTime(input);
    if (!parsed) return null;
    return {
      commonAreaName: "Salão de Festas",
      startsAt: parsed.startsAt.toISOString(),
      endsAt: parsed.endsAt.toISOString(),
    };
  },
);
