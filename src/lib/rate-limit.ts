// ponytail: in-memory, single-instance fixed-window limiter — enough for one Next.js process.
// Upgrade path if this ever runs on more than one instance: Redis INCR + EXPIRE per window key.
const windows = new Map<string, { count: number; windowStartedAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now - existing.windowStartedAt >= windowMs) {
    windows.set(key, { count: 1, windowStartedAt: now });
    return true;
  }

  if (existing.count >= limit) return false;

  existing.count += 1;
  return true;
}

/** Test-only: clears all rate-limit state. */
export function __resetRateLimitForTests() {
  windows.clear();
}
