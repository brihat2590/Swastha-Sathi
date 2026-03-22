const cache = new Map<string, { data: any; timestamp: number }>();

const TTL = 1000 * 60 * 5; // 5 minutes

export function getCachedUserContext(userId: string) {
  const entry = cache.get(userId);

  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > TTL;
  if (isExpired) {
    cache.delete(userId);
    return null;
  }

  return entry.data;
}

export function setCachedUserContext(userId: string, data: any) {
  cache.set(userId, {
    data,
    timestamp: Date.now(),
  });
}