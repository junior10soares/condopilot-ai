"use server";

import { revalidatePath } from "next/cache";
import { requireActor } from "@/lib/actor";
import { requireSelfOrRole } from "@/lib/authz";
import { db } from "@/lib/db";
import { cancelReservation, findReservation } from "@/repositories/reservations";

export async function cancelReservationAction(reservationId: string) {
  const actor = await requireActor();
  const reservation = await findReservation(db, actor.condominiumId, reservationId);
  if (!reservation) return;

  requireSelfOrRole(actor, reservation.userId, "MANAGER");
  await cancelReservation(db, actor.condominiumId, reservationId);
  revalidatePath("/reservations");
}
