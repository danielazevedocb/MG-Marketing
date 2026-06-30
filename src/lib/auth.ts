// Configuração completa do Auth.js (NextAuth v5) — executa no runtime Node.
// Reúne o Prisma Adapter (modelos existentes) e o provider de credenciais.
// Importado apenas no servidor; nunca em Client Components.
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyCredentials } from "@/services/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      // Sistema interno: login por e-mail/senha (sem cadastro self-service).
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      // A verificação fica em `verifyCredentials` (testável isoladamente).
      authorize: (rawCredentials) => verifyCredentials(rawCredentials),
    }),
  ],
});
