// Rate limiter in-memory com janela deslizante.
// Em Vercel serverless funciona por instância (proteção best-effort contra burst);
// para limitar globalmente, substituir pelo @upstash/ratelimit com Redis.

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

const WINDOW_MS = 60_000; // 1 minuto
const MAX_ATTEMPTS = 5;

export type RateLimitResult =
  { allowed: true } | { allowed: false; retryAfterMs: number };

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  return { allowed: true };
}
