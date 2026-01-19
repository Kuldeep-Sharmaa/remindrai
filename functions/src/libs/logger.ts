/**
 * logger.ts
 *
 * Purpose:
 * Minimal structured logger for Cloud Functions.
 *
 * LOCKED DESIGN:
 * - No child loggers
 * - No dynamic level switching
 * - No external error forwarding
 * - No retries
 * - No hidden mutation
 *
 * Uses console.* so Cloud Logging picks it up automatically.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[LOG_LEVEL];
}

function nowIso(): string {
  return new Date().toISOString();
}

function log(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): void {
  if (!shouldLog(level)) return;

  const entry = {
    timestamp: nowIso(),
    severity: level,
    message,
    ...(meta ? { meta } : {}),
  };

  const json = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(json);
      break;
    case "warn":
      console.warn(json);
      break;
    case "info":
      console.log(json);
      break;
    default:
      console.debug ? console.debug(json) : console.log(json);
  }
}

/**
 * Exported logger (singleton)
 */
export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    log("debug", message, meta);
  },

  info(message: string, meta?: Record<string, unknown>) {
    log("info", message, meta);
  },

  warn(message: string, meta?: Record<string, unknown>) {
    log("warn", message, meta);
  },

  error(message: string, meta?: Record<string, unknown>) {
    log("error", message, meta);
  },
};

export default logger;
