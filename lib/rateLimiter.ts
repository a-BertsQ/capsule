type Entry = {
  attempts: number;
  firstAt: number;
  blockedUntil?: number;
};

const STORE = new Map<string, Entry>();

const MAX_ATTEMPTS = Number(process.env.SIGNIN_MAX_ATTEMPTS ?? 5);
const WINDOW_MS = Number(process.env.SIGNIN_WINDOW_MS ?? 15 * 60 * 1000); // 15m
const BLOCK_MS = Number(process.env.SIGNIN_BLOCK_MS ?? 15 * 60 * 1000); // 15m

export function isBlocked(
  key: string,
  maxAttempts: number = MAX_ATTEMPTS,
  windowMs: number = WINDOW_MS
) {
  const now = Date.now();
  const e = STORE.get(key);
  if (!e) return { blocked: false };
  if (e.blockedUntil && e.blockedUntil > now) {
    return { blocked: true, until: e.blockedUntil };
  }
  return { blocked: false };
}

export function recordFailure(
  key: string,
  maxAttempts: number = MAX_ATTEMPTS,
  windowMs: number = WINDOW_MS,
  blockMs: number = BLOCK_MS
) {
  const now = Date.now();
  const e = STORE.get(key);
  if (!e) {
    STORE.set(key, { attempts: 1, firstAt: now });
    return;
  }

  // reset window
  if (now - e.firstAt > windowMs) {
    e.attempts = 1;
    e.firstAt = now;
    e.blockedUntil = undefined;
    STORE.set(key, e);
    return;
  }

  e.attempts += 1;
  if (e.attempts >= maxAttempts) {
    e.blockedUntil = now + blockMs;
  }
  STORE.set(key, e);
}

export function recordSuccess(key: string) {
  STORE.delete(key);
}

export function getAttempts(key: string) {
  const e = STORE.get(key);
  if (!e) return 0;
  return e.attempts;
}
