// ─── Rate Limiter Tests ─────────────────────────────────────────────────────
import { describe, it, expect, afterEach } from 'vitest';
import { InMemoryRateLimiter } from '@/lib/security/rate-limiter';

describe('InMemoryRateLimiter', () => {
  let limiter: InMemoryRateLimiter;

  afterEach(() => {
    limiter?.destroy();
  });

  it('should allow requests within limit', async () => {
    limiter = new InMemoryRateLimiter({ windowMs: 60000, maxRequests: 5 });

    for (let i = 0; i < 5; i++) {
      await limiter.consume('test-key');
    }

    const { allowed, remaining } = await limiter.check('test-key');
    expect(allowed).toBe(false);
    expect(remaining).toBe(0);
  });

  it('should reject requests exceeding limit', async () => {
    limiter = new InMemoryRateLimiter({ windowMs: 60000, maxRequests: 2 });

    await limiter.consume('test-key');
    await limiter.consume('test-key');

    await expect(limiter.consume('test-key')).rejects.toThrow(
      'Too many requests'
    );
  });

  it('should track different keys independently', async () => {
    limiter = new InMemoryRateLimiter({ windowMs: 60000, maxRequests: 1 });

    await limiter.consume('key-a');
    await limiter.consume('key-b');

    // key-a should be exhausted
    await expect(limiter.consume('key-a')).rejects.toThrow();
    // key-b should also be exhausted
    await expect(limiter.consume('key-b')).rejects.toThrow();
  });

  it('should report remaining tokens', async () => {
    limiter = new InMemoryRateLimiter({ windowMs: 60000, maxRequests: 5 });

    await limiter.consume('test-key');
    await limiter.consume('test-key');

    const { remaining } = await limiter.check('test-key');
    expect(remaining).toBe(3);
  });
});
