// Route Handler do runner de agendamento — acionado por cron externo (Vercel Cron, etc.).
import { NextResponse } from "next/server";

import { getScheduleRunnerService } from "@/services/schedule-runner";

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === cronSecret;
}

async function handleRun() {
  const result = await getScheduleRunnerService().runDueCampaigns();
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return handleRun();
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return handleRun();
}
