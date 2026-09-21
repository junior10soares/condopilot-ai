import type { Actor } from "@/lib/actor";

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "****";

  const visibleLocal = local.length <= 2 ? local[0] : local.slice(0, 2);
  const [domainName, ...rest] = domain.split(".");
  const maskedDomainName =
    domainName.length <= 1 ? "*" : domainName[0] + "*".repeat(domainName.length - 1);

  return `${visibleLocal}${"*".repeat(Math.max(local.length - visibleLocal.length, 3))}@${maskedDomainName}.${rest.join(".")}`;
}

export type ResidentRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  unit: string | null;
};

/** Everyone sees the directory; only the row owner and managers/admins see a real email. */
export function presentResidentsForActor<T extends ResidentRow>(actor: Actor, residents: T[]): T[] {
  const canSeeAllEmails = actor.role === "MANAGER" || actor.role === "ADMIN";

  return residents.map((resident) => {
    if (canSeeAllEmails || resident.id === actor.userId) return resident;
    return { ...resident, email: maskEmail(resident.email) };
  });
}
