import type { PrismaClient } from "@prisma/client";

export function listChargesForUser(prisma: PrismaClient, condominiumId: string, userId: string) {
  return prisma.charge.findMany({
    where: { condominiumId, userId },
    orderBy: { dueDate: "desc" },
  });
}

/** Managers-only view: every resident with at least one overdue, unpaid charge, plus how much they owe. */
export async function listResidentsInDebt(prisma: PrismaClient, condominiumId: string) {
  const overdueCharges = await prisma.charge.findMany({
    where: { condominiumId, paidAt: null, dueDate: { lt: new Date() } },
  });

  const users = await prisma.user.findMany({
    where: { condominiumId, id: { in: [...new Set(overdueCharges.map((c) => c.userId))] } },
    select: { id: true, name: true, unit: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  const byUser = new Map<
    string,
    { userId: string; name: string; unit: string | null; totalOwedCents: number }
  >();
  for (const charge of overdueCharges) {
    const user = userById.get(charge.userId);
    if (!user) continue; // defensive: tenant mismatch would mean a data bug, never surface it
    const entry = byUser.get(charge.userId) ?? {
      userId: charge.userId,
      name: user.name,
      unit: user.unit,
      totalOwedCents: 0,
    };
    entry.totalOwedCents += charge.amountCents;
    byUser.set(charge.userId, entry);
  }

  return Array.from(byUser.values()).sort((a, b) => b.totalOwedCents - a.totalOwedCents);
}
