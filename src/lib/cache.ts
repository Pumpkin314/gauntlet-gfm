import { Redis } from '@upstash/redis';

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Execute a query with Redis caching.
 * Returns cached result if available; otherwise runs queryFn,
 * stores the result with the given TTL (in seconds), and returns it.
 * Falls through to queryFn directly if Redis is not configured.
 */
export async function cachedQuery<T>(
  key: string,
  ttl: number,
  queryFn: () => Promise<T>,
): Promise<T> {
  if (redis) {
    try {
      const cached = await redis.get<string>(key);
      if (cached) return JSON.parse(cached) as T;
    } catch {
      // Redis unavailable — fall through to query
    }
  }

  const result = await queryFn();

  if (redis) {
    try {
      await redis.set(key, JSON.stringify(result), { ex: ttl });
    } catch {
      // Redis unavailable — skip caching
    }
  }

  return result;
}

/**
 * Invalidate all cache keys matching the given glob pattern.
 * E.g. invalidateCache('fundraiser:*') removes all fundraiser cache entries.
 */
export async function invalidateCache(pattern: string) {
  if (!redis) return;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}

export { redis };
