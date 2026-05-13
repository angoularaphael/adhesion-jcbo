const store = /* @__PURE__ */ new Map();
const IP_BLACKLIST = /* @__PURE__ */ new Set();
const EMAIL_BLACKLIST = /* @__PURE__ */ new Set([
  "test@test.com",
  "admin@admin.com",
  "root@root.com"
]);
function isBlacklisted(value) {
  return IP_BLACKLIST.has(value) || EMAIL_BLACKLIST.has(value.toLowerCase());
}
function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1e3) {
  const now = Date.now();
  const record = store.get(key);
  if (!record || now - record.firstAttempt > windowMs) {
    store.set(key, { count: 1, firstAttempt: now, blocked: false });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterMs: 0 };
  }
  if (record.blocked || record.count >= maxAttempts) {
    const retryAfterMs = windowMs - (now - record.firstAttempt);
    if (record.count >= 10) ;
    return { allowed: false, remaining: 0, retryAfterMs };
  }
  record.count++;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    retryAfterMs: 0
  };
}
function resetRateLimit(key) {
  store.delete(key);
}

export { checkRateLimit as c, isBlacklisted as i, resetRateLimit as r };
