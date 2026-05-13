interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  blocked: boolean;
}

const store = new Map<string, RateLimitRecord>();

// Blacklist d'IPs et emails connus comme malveillants
const IP_BLACKLIST = new Set<string>();
const EMAIL_BLACKLIST = new Set([
  "test@test.com",
  "admin@admin.com",
  "root@root.com",
]);

export function isBlacklisted(value: string): boolean {
  return IP_BLACKLIST.has(value) || EMAIL_BLACKLIST.has(value.toLowerCase());
}

export function blacklistIP(ip: string): void {
  IP_BLACKLIST.add(ip);
}

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now - record.firstAttempt > windowMs) {
    store.set(key, { count: 1, firstAttempt: now, blocked: false });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterMs: 0 };
  }

  if (record.blocked || record.count >= maxAttempts) {
    const retryAfterMs = windowMs - (now - record.firstAttempt);
    // Blacklist automatique après 10 tentatives
    if (record.count >= 10) {
      // En prod: blacklister l'IP ici
    }
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    retryAfterMs: 0,
  };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}
