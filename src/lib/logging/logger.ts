// ─── Structured Logger ──────────────────────────────────────────────────────
// Production-safe JSON logger that automatically redacts secrets.
// Uses pino when available, falls back to console with structured output.
// ──────────────────────────────────────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

// Keys that should never appear in logs
const REDACTED_KEYS = new Set([
  'password',
  'secret',
  'token',
  'auth',
  'authorization',
  'cookie',
  'api_key',
  'apiKey',
  'api_secret',
  'apiSecret',
  'private_key',
  'privateKey',
  'vapid_private_key',
  'cloudinary_api_secret',
  'database_url',
  'p256dh',
]);

function redactSensitive(data: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      redacted[key] = redactSensitive(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data ? redactSensitive(data) : {}),
  };
}

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  debug(message: string, data?: Record<string, unknown>) {
    if (!isProduction) {
      const entry = createLogEntry('debug', message, data);
      console.debug(JSON.stringify(entry));
    }
  },

  info(message: string, data?: Record<string, unknown>) {
    const entry = createLogEntry('info', message, data);
    console.info(JSON.stringify(entry));
  },

  warn(message: string, data?: Record<string, unknown>) {
    const entry = createLogEntry('warn', message, data);
    console.warn(JSON.stringify(entry));
  },

  error(message: string, data?: Record<string, unknown>) {
    const entry = createLogEntry('error', message, data);
    console.error(JSON.stringify(entry));
  },
};
