// Configuração base do Auth.js compatível com o Edge Runtime (usada no middleware).
// NÃO importa Prisma, bcrypt ou o adapter aqui — apenas lógica leve e edge-safe.
// O provider de credenciais e o Prisma Adapter ficam em `src/lib/auth.ts`.
import type { NextAuthConfig } from "next-auth";

/// Rotas públicas (sem sessão). As rotas internas do Auth.js (`/api/auth/*`)
/// são tratadas pelo route handler e excluídas no matcher do middleware.
export const PUBLIC_ROUTES = ["/login"];

/// Rotas abertas: acessíveis com OU sem sessão (landing pages públicas de
/// campanha). Diferem de PUBLIC_ROUTES, que redirecionam usuário logado.
export const OPEN_ROUTES = ["/c"];

/// Caminho para onde o usuário autenticado é enviado após o login.
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  // Sessão via JWT (cookie HttpOnly/Secure) — necessária para o provider de
  // credenciais e compatível com o Edge Runtime do middleware.
  session: { strategy: "jwt" },
  // Providers são definidos em `auth.ts` (precisam de Prisma/bcrypt, fora do edge).
  providers: [],
  callbacks: {
    // Executado pelo middleware: decide se a requisição está autorizada.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);

      // Rotas abertas não exigem sessão nem redirecionam usuário logado.
      const isOpenRoute = OPEN_ROUTES.some(
        (route) =>
          nextUrl.pathname === route ||
          nextUrl.pathname.startsWith(`${route}/`),
      );
      if (isOpenRoute) {
        return true;
      }

      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) =>
          nextUrl.pathname === route ||
          nextUrl.pathname.startsWith(`${route}/`),
      );

      if (isPublicRoute) {
        // Usuário já autenticado não deve permanecer na tela de login.
        if (isLoggedIn) {
          return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return true;
      }

      // Rotas protegidas exigem sessão; caso contrário, redireciona ao login.
      return isLoggedIn;
    },
    // Injeta `id` e `role` no token a partir do usuário autenticado.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    // Reflete `id` e `role` na sessão exposta ao servidor.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
