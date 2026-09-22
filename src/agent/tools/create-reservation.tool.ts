import { z } from "zod";
import { registerTool } from "@/agent/tool-registry";
import { ToolExecutionError } from "@/agent/types";
import { matchesAny } from "@/agent/match";
import { createReservation, ReservationConflictError } from "@/repositories/reservations";
import { parseReservationTime } from "./reservation-time-parser";

const inputSchema = z.object({
  commonAreaName: z.string(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  note: z.string().optional(),
});
const outputSchema = z.object({ reservationId: z.string(), startsAt: z.date(), endsAt: z.date() });

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function extractNote(input: string): string | undefined {
  const match = input.match(/\bpara\s+([a-zà-ú]+)/i);
  return match ? match[1] : undefined;
}

registerTool(
  {
    name: "createReservation",
    description: "Reserva o Salão de Festas",
    minRole: "RESIDENT",
    // Ação financeira/consequente, conforme docs/agent-contract.md.
    requiresConfirmation: true,
    inputSchema,
    outputSchema,
    async execute({ db }, actor, args) {
      const commonArea = await db.commonArea.findFirst({
        where: { condominiumId: actor.condominiumId, name: args.commonAreaName },
      });
      if (!commonArea) throw new ToolExecutionError("Não encontrei essa área comum no condomínio.");

      try {
        const reservation = await createReservation(db, {
          condominiumId: actor.condominiumId,
          commonAreaId: commonArea.id,
          userId: actor.userId,
          startsAt: args.startsAt,
          endsAt: args.endsAt,
          note: args.note,
        });
        return {
          reservationId: reservation.id,
          startsAt: reservation.startsAt,
          endsAt: reservation.endsAt,
        };
      } catch (error) {
        if (error instanceof ReservationConflictError) {
          throw new ToolExecutionError(
            "Esse horário já está reservado para o Salão de Festas. Tente outro horário.",
          );
        }
        throw error;
      }
    },
    respond(args, result) {
      const forWhom = args.note ? ` (para ${args.note})` : "";
      return `Reserva confirmada para o Salão de Festas${forWhom}: ${formatDateTime(result.startsAt)}.`;
    },
  },
  (input) => {
    if (!matchesAny(input, ["salão", "salao"]) || !matchesAny(input, ["reserv"])) return null;
    const parsed = parseReservationTime(input);
    if (!parsed) return null;
    return {
      commonAreaName: "Salão de Festas",
      startsAt: parsed.startsAt.toISOString(),
      endsAt: parsed.endsAt.toISOString(),
      note: extractNote(input),
    };
  },
);
