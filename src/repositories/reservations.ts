import { Prisma, type PrismaClient } from "@prisma/client";

export class ReservationConflictError extends Error {
  constructor() {
    super("RESERVATION_CONFLICT");
    this.name = "ReservationConflictError";
  }
}

export function listCommonAreas(prisma: PrismaClient, condominiumId: string) {
  return prisma.commonArea.findMany({ where: { condominiumId }, orderBy: { name: "asc" } });
}

export function listReservationsForUser(
  prisma: PrismaClient,
  condominiumId: string,
  userId: string,
) {
  return prisma.reservation.findMany({
    where: { condominiumId, userId },
    include: { commonArea: { select: { name: true } } },
    orderBy: { startsAt: "desc" },
  });
}

/** Manager view: every upcoming confirmed reservation across the condominium, with the booker's name. */
export async function listUpcomingReservations(prisma: PrismaClient, condominiumId: string) {
  const reservations = await prisma.reservation.findMany({
    where: { condominiumId, status: "CONFIRMED", startsAt: { gt: new Date() } },
    include: { commonArea: { select: { name: true } } },
    orderBy: { startsAt: "asc" },
  });

  const users = await prisma.user.findMany({
    where: { condominiumId, id: { in: [...new Set(reservations.map((r) => r.userId))] } },
    select: { id: true, name: true, unit: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  return reservations.map((reservation) => ({
    ...reservation,
    user: userById.get(reservation.userId) ?? null,
  }));
}

async function hasOverlap(
  prisma: Prisma.TransactionClient,
  condominiumId: string,
  commonAreaId: string,
  startsAt: Date,
  endsAt: Date,
) {
  const conflict = await prisma.reservation.findFirst({
    where: {
      condominiumId,
      commonAreaId,
      status: "CONFIRMED",
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
  });
  return conflict !== null;
}

export async function isAvailable(
  prisma: PrismaClient,
  condominiumId: string,
  commonAreaId: string,
  startsAt: Date,
  endsAt: Date,
) {
  return !(await hasOverlap(prisma, condominiumId, commonAreaId, startsAt, endsAt));
}

/**
 * Re-checks the overlap inside a SERIALIZABLE transaction: if two requests race for the same
 * slot, Postgres aborts the loser with a serialization failure instead of both succeeding.
 */
export async function createReservation(
  prisma: PrismaClient,
  params: {
    condominiumId: string;
    commonAreaId: string;
    userId: string;
    startsAt: Date;
    endsAt: Date;
    note?: string;
  },
) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        if (
          await hasOverlap(
            tx,
            params.condominiumId,
            params.commonAreaId,
            params.startsAt,
            params.endsAt,
          )
        ) {
          throw new ReservationConflictError();
        }
        return tx.reservation.create({
          data: {
            condominiumId: params.condominiumId,
            commonAreaId: params.commonAreaId,
            userId: params.userId,
            startsAt: params.startsAt,
            endsAt: params.endsAt,
            note: params.note,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof ReservationConflictError) throw error;
    // Postgres serialization failure (concurrent writer won the race) — same business outcome.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      throw new ReservationConflictError();
    }
    throw error;
  }
}

export async function cancelReservation(
  prisma: PrismaClient,
  condominiumId: string,
  reservationId: string,
): Promise<boolean> {
  const result = await prisma.reservation.updateMany({
    where: { id: reservationId, condominiumId, status: "CONFIRMED" },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  return result.count > 0;
}

export function findReservation(
  prisma: PrismaClient,
  condominiumId: string,
  reservationId: string,
) {
  return prisma.reservation.findFirst({ where: { id: reservationId, condominiumId } });
}
