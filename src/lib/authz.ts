import type { Role } from "@prisma/client";
import type { Actor } from "@/lib/actor";

export class AuthorizationError extends Error {
  constructor(message = "FORBIDDEN") {
    super(message);
    this.name = "AuthorizationError";
  }
}

const roleRank: Record<Role, number> = {
  RESIDENT: 0,
  MANAGER: 1,
  ADMIN: 2,
};

/** Throws unless the actor's role is at least `minimum`. */
export function requireRole(actor: Actor, minimum: Role): void {
  if (roleRank[actor.role] < roleRank[minimum]) {
    throw new AuthorizationError(`ROLE_${minimum}_REQUIRED`);
  }
}

/** Throws unless the resource belongs to the actor's own condominium. */
export function assertSameTenant(actor: Actor, resourceCondominiumId: string): void {
  if (actor.condominiumId !== resourceCondominiumId) {
    throw new AuthorizationError("TENANT_MISMATCH");
  }
}

/** Throws unless the actor is the resource owner or at least `minimum` role. */
export function requireSelfOrRole(actor: Actor, resourceUserId: string, minimum: Role): void {
  if (actor.userId === resourceUserId) return;
  requireRole(actor, minimum);
}
