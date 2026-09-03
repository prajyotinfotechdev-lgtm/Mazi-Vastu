// ─── MaziVastu Environment Configuration ──────────────────────────────────────
// Validates all required environment variables at startup using Zod.
// Fails fast with clear error messages if configuration is invalid.
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth.js
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 characters'),
  AUTH_URL: z.string().url().optional(),

  // Admin (for seeding)
  ADMIN_EMAIL: z.string().email().default('admin@majivastu.com'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters').optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  // VAPID (Web Push)
  VAPID_PUBLIC_KEY: z.string().min(1, 'VAPID_PUBLIC_KEY is required'),
  VAPID_PRIVATE_KEY: z.string().min(1, 'VAPID_PRIVATE_KEY is required'),
  VAPID_SUBJECT: z.string().min(1, 'VAPID_SUBJECT is required'),

  // WhatsApp
  WHATSAPP_ADMIN_NUMBER: z.string().regex(/^\d{10,15}$/, 'Invalid WhatsApp number format').optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(100),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _env: EnvConfig | null = null;

/**
 * Validates and returns the application environment configuration.
 * Call this at startup to fail fast on missing/invalid env vars.
 */
export function getEnv(): EnvConfig {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error('❌ Invalid environment configuration:\n' + errors);

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration. Check server logs.');
    } else {
      throw new Error(
        '❌ Invalid environment configuration:\n' + errors +
        '\n\nCopy .env.example to .env and fill in the values.'
      );
    }
  }

  _env = result.data;
  return _env;
}

/**
 * Returns only client-safe environment values.
 * Never expose secrets through this function.
 */
export function getPublicEnv() {
  const env = getEnv();
  return {
    appUrl: env.NEXT_PUBLIC_APP_URL,
    vapidPublicKey: env.VAPID_PUBLIC_KEY,
  };
}
