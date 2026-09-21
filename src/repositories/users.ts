import type { PrismaClient } from "@prisma/client";

/**
 * Every repository function takes a Prisma client and `condominiumId` as
 * explicit, required arguments and folds the tenant id into the query — this
 * is the compile-time and run-time guardrail against cross-tenant data leaks
 * (see specs/00-foundation), and it keeps these functions testable against an
 * isolated test database without touching the app's singleton client.
 */
export function listUsersForCondominium(prisma: PrismaClient, condominiumId: string) {
  return prisma.user.findMany({
    where: { condominiumId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, unit: true, createdAt: true },
  });
}

export function findUserInCondominium(prisma: PrismaClient, condominiumId: string, userId: string) {
  return prisma.user.findFirst({
    where: { id: userId, condominiumId },
    select: { id: true, name: true, email: true, role: true, unit: true, createdAt: true },
  });
}
