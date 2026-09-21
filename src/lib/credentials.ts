import { compare } from "bcryptjs";
import type { PrismaClient } from "@prisma/client";

export async function verifyCredentials(prisma: PrismaClient, email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Constant-shape response: never reveal whether the email exists.
  if (!user) return null;

  const passwordValid = await compare(password, user.passwordHash);
  if (!passwordValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    condominiumId: user.condominiumId,
    role: user.role,
  };
}
