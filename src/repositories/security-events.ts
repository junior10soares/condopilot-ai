import type { PrismaClient } from "@prisma/client";

/** Denied and rate-limited agent executions, with the actor's name — the events a Security Center cares about. */
export async function listSecurityEvents(prisma: PrismaClient, condominiumId: string, limit = 50) {
  const events = await prisma.agentExecution.findMany({
    where: { condominiumId, status: { in: ["DENIED", "RATE_LIMITED"] } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const users = await prisma.user.findMany({
    where: { condominiumId, id: { in: [...new Set(events.map((e) => e.userId))] } },
    select: { id: true, name: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  return events.map((event) => ({ ...event, actorName: nameById.get(event.userId) ?? "—" }));
}
