/**
 * libs/logger.js
 * --------------
 * Lightweight, production-ready structured logger for Cloud Functions / Node.js
 *
 * Goals:
 *  - Emit structured JSON logs (compatible with Cloud Logging / Stackdriver).
 *  - Configurable log level via process.env.LOG_LEVEL.
 *  - Safe metadata attachment (requestId, uid, runId, functionName).
 *  - Minimal dependency surface (no external libs required).
 *  - Pluggable error-forwarding to an external error-tracker (Sentry, Rollbar).
 *  - Small `child()` API to create per-request/per-job loggers with default metadata.
 *
 * Usage:
 *  const logger = require('./libs/logger');
 *  logger.info('User created', { uid, requestId });
 *  const reqLogger = logger.child({ requestId, functionName: 'createReminder' });
 *  reqLogger.error('Failed to create reminder', { err });
 *
 * Notes / safety:
 *  - Avoid logging secrets. If metadata appears to contain keys that look secret-like
 *    (e.g., apiKey, token, password) they will be redacted automatically.
 *  - Uses console.* which Cloud Functions picks up and forwards to Cloud Logging.
 *  - Keep the module small and synchronous for minimal overhead.
 */

const DEFAULT_LOG_LEVEL = "info";
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const REDACT_KEYS = [
  "password",
  "pwd",
  "token",
  "accessKey",
  "secret",
  "apiKey",
  "authorization",
  "auth",
];

/**
 * Helper: current iso timestamp
 */
function nowIso() {
  return new Date().toISOString();
}

/**
 * Helper: normalize log level from env
 */
function getConfiguredLevel() {
  const env = String(process.env.LOG_LEVEL || DEFAULT_LOG_LEVEL).toLowerCase();
  return LEVELS[env] ? env : DEFAULT_LOG_LEVEL;
}

let currentLevel = getConfiguredLevel();

/**
 * Helper: simple redaction of secret-like metadata fields
 */
function redactSecrets(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redactSecrets);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if (
      REDACT_KEYS.includes(lower) ||
      REDACT_KEYS.some((rk) => lower.includes(rk))
    ) {
      out[k] = "[REDACTED]";
    } else if (v && typeof v === "object") {
      try {
        out[k] = redactSecrets(v);
      } catch (e) {
        out[k] = "[UNSERIALIZABLE]";
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Helper: safely serialize errors
 */
function serializeError(err) {
  if (!err) return null;
  if (typeof err === "string") return { message: err };
  if (err instanceof Error) {
    const serial = {
      message: err.message,
      name: err.name,
      stack: err.stack,
    };
    // include custom error fields if present
    for (const key of Object.keys(err)) {
      if (!serial[key]) serial[key] = err[key];
    }
    return serial;
  }
  // fallback - try to shallow clone
  try {
    return JSON.parse(JSON.stringify(err));
  } catch (e) {
    return { message: String(err) };
  }
}

/**
 * Core logger factory
 * - level: minimal severity that will be emitted
 * - defaultMeta: metadata merged into every log call (e.g., { requestId, uid })
 * - forwardError: optional function(err, meta) -> for external error reporting
 */
function createLogger({
  level = currentLevel,
  defaultMeta = {},
  forwardError = null,
} = {}) {
  const configuredLevel = LEVELS[level] ? level : currentLevel;

  function shouldLog(msgLevel) {
    return LEVELS[msgLevel] >= LEVELS[configuredLevel];
  }

  function buildEntry(severity, message, meta) {
    const safeMeta = redactSecrets(meta || {});
    const entry = {
      timestamp: nowIso(),
      severity,
      message,
      // Reserved fields for Cloud Logging structured logs
      ...("requestId" in safeMeta ? { requestId: safeMeta.requestId } : {}),
      ...("uid" in safeMeta ? { uid: safeMeta.uid } : {}),
      function: safeMeta.functionName || process.env.FUNCTION_NAME || null,
      // attach the rest under meta
      meta: safeMeta,
    };
    return entry;
  }

  function logToConsole(severity, message, meta) {
    try {
      const entry = buildEntry(severity, message, meta);
      const json = JSON.stringify(entry);
      // Use console.* mapping to severity
      if (severity === "error") {
        console.error(json);
      } else if (severity === "warn") {
        console.warn(json);
      } else if (severity === "info") {
        console.log(json);
      } else {
        // debug and others
        console.debug ? console.debug(json) : console.log(json);
      }
    } catch (e) {
      // Last-resort fallback - do not throw from logger
      try {
        console.error(
          JSON.stringify({
            timestamp: nowIso(),
            severity: "error",
            message: "logger.serialize_failure",
            meta: {
              originalMessage: String(message),
              serializationError: String(e),
            },
          })
        );
      } catch (_) {
        /* ignore */
      }
    }
  }

  function maybeForwardError(err, meta = {}) {
    try {
      if (typeof forwardError === "function") {
        const serialErr = serializeError(err);
        // forward minimal payload - do not forward secrets
        forwardError(serialErr, redactSecrets(meta));
      }
    } catch (e) {
      // swallowing forwarding errors - logging locally only
      try {
        console.error(
          JSON.stringify({
            timestamp: nowIso(),
            severity: "warn",
            message: "logger.forward_error_failed",
            meta: { forwardErrorError: String(e) },
          })
        );
      } catch (_) {
        /* ignore */
      }
    }
  }

  return {
    level: configuredLevel,

    debug(message, meta = {}) {
      if (!shouldLog("debug")) return;
      logToConsole("debug", message, meta);
    },

    info(message, meta = {}) {
      if (!shouldLog("info")) return;
      logToConsole("info", message, meta);
    },

    warn(message, meta = {}) {
      if (!shouldLog("warn")) return;
      logToConsole("warn", message, meta);
    },

    error(message, meta = {}) {
      if (!shouldLog("error")) return;
      // If message is an Error, serialize nicely
      const metaWithErr = { ...meta };
      if (message instanceof Error) {
        metaWithErr.error = serializeError(message);
        logToConsole("error", message.message || "Error", {
          ...defaultMeta,
          ...metaWithErr,
        });
        maybeForwardError(message, { ...defaultMeta, ...metaWithErr });
      } else {
        logToConsole("error", message, { ...defaultMeta, ...metaWithErr });
      }
    },

    /**
     * child(meta)
     * Returns a new logger that merges provided meta into every log call.
     * Useful per-request or per-job.
     */
    child(childMeta = {}) {
      const mergedMeta = { ...(defaultMeta || {}), ...(childMeta || {}) };
      return createLogger({
        level: configuredLevel,
        defaultMeta: mergedMeta,
        forwardError,
      });
    },

    /**
     * Update logger level at runtime (useful for debugging in prod)
     */
    setLevel(newLevel) {
      if (LEVELS[newLevel]) {
        currentLevel = newLevel;
        return true;
      }
      return false;
    },

    /**
     * Attach/replace external error forwarder (e.g., Sentry.captureException)
     * forwardFn receives (errorObject, meta)
     */
    setErrorForwarder(fn) {
      if (typeof fn !== "function")
        throw new Error("setErrorForwarder requires a function");
      // return a new logger with forwarder attached, keeping same level/meta
      return createLogger({
        level: configuredLevel,
        defaultMeta,
        forwardError: fn,
      });
    },

    // expose helper for tests / ops
    _internal: {
      serializeError,
      redactSecrets,
      buildEntry,
      LEVELS,
      currentLevel: () => currentLevel,
    },
  };
}

/**
 * Default singleton logger
 * - Uses LOG_LEVEL env variable
 * - Other modules should import this singleton
 */
const defaultLogger = createLogger({
  level: getConfiguredLevel(),
  defaultMeta: {},
});

module.exports = defaultLogger;
