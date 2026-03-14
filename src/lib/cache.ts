import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

/**
 * Execute a query with Redis caching.
 * Returns cached result if available; otherwise runs queryFn,
 * stores the result with the given TTL (in seconds), and returns it.
 */
export async function cachedQuery<T>(
  key: string,
  ttl: number,
  queryFn: () => Promise<T>,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as T;

  const result = await queryFn();
  await redis.set(key, JSON.stringify(result), 'EX', ttl);
  return result;
}

/**
 * Invalidate all cache keys matching the given glob pattern.
 * E.g. invalidateCache('fundraiser:*') removes all fundraiser cache entries.
 */
export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}

export { redis };
