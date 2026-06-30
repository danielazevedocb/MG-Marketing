// Route Handler protegido de exemplo/utilidade: retorna o usuário autenticado.
// Demonstra a guarda de autenticação no servidor (responde 401 sem sessão).
import { NextResponse } from "next/server";

import { toAuthErrorResponse } from "@/lib/auth-response";
import { requireAuth } from "@/services/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    return NextResponse.json({ user });
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
