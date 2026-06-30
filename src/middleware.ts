// Middleware de proteção de rotas (camada de UX/redirect).
// IMPORTANTE: o middleware NÃO substitui a verificação no servidor. Toda Server
// Action e Route Handler deve aplicar `requireAuth`/`requireRole` (fonte da verdade).
// Usa apenas `authConfig` (edge-safe) — sem Prisma/bcrypt.
import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protege rotas de página. Exclui rotas internas do Next, estáticos e a API
  // (incluindo `/api/auth/*`); a API impõe 401/403 nos próprios handlers.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
