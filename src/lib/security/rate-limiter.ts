// ─── Rate Limiter ────────────────────────────────────────────────────────────
// In-memory sliding window rate limiter. Abstracted behind RateLimiter
// interface so it can be replaced with Redis-backed implementation later.
// ──────────────────────────────────────────────────────────────────────────────

import { RateLimitError } from '@/lib/errors';

export interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

export interface RateLimiter {
  check(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }>;
  consume(key: string): Promise<void>;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * In-memory rate limiter using token bucket algorithm.
 * Suitable for single-process VPS deployment.
 * Replace with Redis-backed implementation if horizontal scaling is needed.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, TokenBucket>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private config: RateLimitConfig) {
    // Periodically clean up expired buckets to prevent memory leaks
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      config.windowMs * 2
    );
  }

  async check(key: string): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const bucket = this.getBucket(key);
    this.refill(bucket);

    return {
      allowed: bucket.tokens > 0,
      remaining: Math.max(0, bucket.tokens),
      resetAt: bucket.lastRefill + this.config.windowMs,
    };
  }

  async consume(key: string): Promise<void> {
    const bucket = this.getBucket(key);
    this.refill(bucket);

    if (bucket.tokens <= 0) {
      throw new RateLimitError();
    }

    bucket.tokens -= 1;
  }

  private getBucket(key: string): TokenBucket {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = {
        tokens: this.config.maxRequests,
        lastRefill: Date.now(),
      };
      this.buckets.set(key, bucket);
    }
    return bucket;
  }

  private refill(bucket: TokenBucket): void {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;

    if (elapsed >= this.config.windowMs) {
      bucket.tokens = this.config.maxRequests;
      bucket.lastRefill = now;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.lastRefill > this.config.windowMs * 2) {
        this.buckets.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.buckets.clear();
  }
}

// ─── Pre-configured Rate Limiters ────────────────────────────────────────────

/** Strict: 5 requests per minute (login, registration) */
export const strictRateLimiter = new InMemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 5,
});

/** Standard: 30 requests per minute (form submissions) */
export const standardRateLimiter = new InMemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
});

/** Relaxed: 100 requests per minute (public browsing) */
export const relaxedRateLimiter = new InMemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
});

/**
 * Extracts a rate-limit key from the request.
 * Uses X-Forwarded-For header or falls back to a default key.
 */
export function getRateLimitKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `${prefix}:${ip}`;
}
