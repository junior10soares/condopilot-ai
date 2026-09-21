import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Prisma/bcrypt here — those are Node-only).
 * Used directly by middleware; extended with the Credentials provider in `auth.ts`
 * for route handlers and server components.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  // Self-hosted (not Vercel) — trust the request host instead of requiring AUTH_URL.
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.condominiumId = user.condominiumId;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.condominiumId = token.condominiumId;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
