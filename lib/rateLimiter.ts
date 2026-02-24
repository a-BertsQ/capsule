type Entry = {
  attempts: number;
  firstAt: number;
  blockedUntil?: number;
};

const STORE = new Map<string, Entry>();

const MAX_ATTEMPTS = Number(process.env.SIGNIN_MAX_ATTEMPTS ?? 5);
const WINDOW_MS = Number(process.env.SIGNIN_WINDOW_MS ?? 15 * 60 * 1000); // 15m
const BLOCK_MS = Number(process.env.SIGNIN_BLOCK_MS ?? 15 * 60 * 1000); // 15m

export function isBlocked(key: string) {
  const now = Date.now();
  const e = STORE.get(key);
  if (!e) return { blocked: false };
  if (e.blockedUntil && e.blockedUntil > now) {
    return { blocked: true, until: e.blockedUntil };
  }
  return { blocked: false };
}

export function recordFailure(key: string) {
  const now = Date.now();
  const e = STORE.get(key);
  if (!e) {
    STORE.set(key, { attempts: 1, firstAt: now });
    return;
  }

  // reset window
  if (now - e.firstAt > WINDOW_MS) {
    e.attempts = 1;
    e.firstAt = now;
    e.blockedUntil = undefined;
    STORE.set(key, e);
    return;
  }

  e.attempts += 1;
  if (e.attempts >= MAX_ATTEMPTS) {
    e.blockedUntil = now + BLOCK_MS;
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
