import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      condominiumId: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    condominiumId: string;
    role: Role;
  }
}

// `next-auth/jwt` re-exports JWT from `@auth/core/jwt` via `export *`, which
// does not participate in declaration merging — augment the origin module.
declare module "@auth/core/jwt" {
  interface JWT {
    condominiumId: string;
    role: Role;
  }
}
