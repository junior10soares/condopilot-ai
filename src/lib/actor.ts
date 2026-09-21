import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

export type Actor = {
  userId: string;
  condominiumId: string;
  role: Role;
};

/**
 * The single source of truth for "who is making this request".
 * Every route handler, server action and agent tool must read identity
 * through this function — never through client-supplied fields.
 */
export async function getCurrentActor(): Promise<Actor | null> {
  const session = await auth();
  if (!session?.user) return null;

  return {
    userId: session.user.id,
    condominiumId: session.user.condominiumId,
    role: session.user.role,
  };
}

export async function requireActor(): Promise<Actor> {
  const actor = await getCurrentActor();
  if (!actor) throw new Error("UNAUTHENTICATED");
  return actor;
}
