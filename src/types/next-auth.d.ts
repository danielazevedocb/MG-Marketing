// Augmentação de tipos do Auth.js (NextAuth v5).
// Injeta `id` e `role` na sessão/JWT para uso no servidor (RBAC).
import type { DefaultSession } from "next-auth";

import type { Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

// O NextAuth v5 resolve o tipo JWT a partir de `@auth/core/jwt`; augmenta-se
// também esse módulo para garantir a tipagem de `token` nos callbacks.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
