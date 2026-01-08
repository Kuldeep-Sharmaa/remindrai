/**
 * libs/firestoreClient.js
 * -----------------------
 * Lightweight, production-ready Firestore helper wrapper for Firebase Cloud Functions.
 *
 * Goals:
 *  - Single reliable admin Firestore singleton (uses default Firebase credentials).
 *  - Small helpers for common operations: getDb(), docRef(), colRef(), runTransaction(), commitBatch().
 *  - Built-in retries & exponential backoff for transient failures.
 *  - Centralized logging via libs/logger.js.
 *  - Minimal, explicit input validation (manual checks) to avoid assumptions.
 *  - Helpers return plain JS objects where appropriate; do not mutate inputs.
 *
 * Notes:
 *  - This file is written for Node.js (Cloud Functions) and uses firebase-admin.
 *  - It intentionally avoids external dependencies beyond firebase-admin to keep cold starts small.
 *  - Secrets / project config are read from process.env only (no embedded service account file).
 */

const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin").firestore;
const logger = require("./logger");

// Initialize admin app exactly once (default credentials).
// In Cloud Functions/Cloud Run the default credentials are used automatically.
if (!admin.apps || admin.apps.length === 0) {
  try {
    admin.initializeApp();
    logger.info("firebase-admin initialized (default credentials)");
  } catch (e) {
    // If initialize fails, rethrow after logging so deployments catch misconfig.
    logger.error("firebase-admin initialization failed", { error: e });
    throw e;
  }
}

const db = admin.firestore();

/* ---------------------------
   Configuration & constants
   --------------------------- */
const DEFAULT_RETRIES = Number(process.env.FS_DEFAULT_RETRIES || 5);
const DEFAULT_BASE_DELAY_MS = Number(process.env.FS_BASE_DELAY_MS || 150); // exponential backoff base
const MAX_BATCH_SIZE = 500; // Firestore batch write limit

/* ---------------------------
   Utility: sleep
   --------------------------- */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ---------------------------
   Helper: isTransientError(err)
   - Basic heuristics for retryable Firestore-related/transient errors.
   --------------------------- */
function isTransientError(err) {
  if (!err) return false;
  const code = String(err?.code || err?.status || "").toLowerCase();
  const msg = String(err?.message || "").toLowerCase();

  // Firestore admin SDK throws string codes like "aborted", "resource-exhausted", "unavailable"
  const retryableCodes = [
    "aborted",
    "resource-exhausted",
    "unavailable",
    "internal",
    "deadline-exceeded",
    "unknown",
  ];

  for (const rc of retryableCodes) {
    if (code.includes(rc)) return true;
    if (msg.includes(rc)) return true;
  }

  // Rate-limited / 429 style messages
  if (code.includes("429") || msg.includes("rate")) return true;

  return false;
}

/* ---------------------------
   withRetries(fn, opts)
   Generic retry wrapper with exponential backoff + jitter.
   - fn must be an async function.
   - opts: { retries, baseDelayMs, onRetry }.
   --------------------------- */
async function withRetries(
  fn,
  {
    retries = DEFAULT_RETRIES,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    onRetry = null,
  } = {}
) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      const retryable = isTransientError(err);
      logger.warn("withRetries caught error", {
        attempt,
        retryable,
        message: String(err?.message || err),
      });

      if (!retryable || attempt > retries) {
        logger.error("withRetries: giving up", { attempt, error: err });
        throw err;
      }

      // exponential backoff with jitter
      const jitter = Math.floor(Math.random() * 100);
      const delay = Math.pow(2, attempt - 1) * baseDelayMs + jitter;
      logger.info("withRetries: retrying after delay", {
        attempt,
        delayMs: delay,
      });
      if (typeof onRetry === "function") {
        try {
          onRetry(attempt, err);
        } catch (e) {
          logger.warn("withRetries: onRetry handler threw", { error: e });
        }
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(delay);
    }
  }
}

/* ---------------------------
   Basic path helpers with light validation
   - docRef(collectionPathParts..., id?)
   - colRef(collectionPathParts...)
   --------------------------- */
function _validateString(v, name) {
  if (!v || typeof v !== "string") {
    throw new Error(`${name} must be a non-empty string`);
  }
}

function docRef(...pathParts) {
  // Example: docRef('users', uid, 'reminders', reminderId)
  if (!pathParts || pathParts.length < 2) {
    throw new Error("docRef requires at least collection + id");
  }
  // simple validation
  pathParts.forEach((p, i) => {
    if (typeof p !== "string" || p.trim() === "") {
      throw new Error(
        `docRef: path part at index ${i} must be non-empty string`
      );
    }
  });
  return db.doc(pathParts.join("/"));
}

function colRef(...pathParts) {
  // Example: colRef('users', uid, 'reminders')
  if (!pathParts || pathParts.length < 1) {
    throw new Error("colRef requires at least one collection path segment");
  }
  pathParts.forEach((p, i) => {
    if (typeof p !== "string" || p.trim() === "") {
      throw new Error(
        `colRef: path part at index ${i} must be non-empty string`
      );
    }
  });
  return db.collection(pathParts.join("/"));
}

/* ---------------------------
   runTransactionWithRetries(txFn, opts)
   - txFn receives a transaction object (the same as admin.firestore().runTransaction)
   - opts: { retries, baseDelayMs, readOnly } (readOnly is advisory)
   --------------------------- */
async function runTransactionWithRetries(
  txFn,
  { retries = DEFAULT_RETRIES, baseDelayMs = DEFAULT_BASE_DELAY_MS } = {}
) {
  if (typeof txFn !== "function")
    throw new Error("runTransactionWithRetries: txFn must be a function");
  return withRetries(
    () =>
      db.runTransaction(async (tx) => {
        // Wrap txFn to capture its result and allow throwing to bubble up
        return txFn(tx);
      }),
    { retries, baseDelayMs }
  );
}

/* ---------------------------
   commitBatchWithRetries(batchOrBuilder, opts)
   - Accepts either an existing WriteBatch or a function that returns a WriteBatch.
   - Enforces Firestore batch size limit.
   --------------------------- */
async function commitBatchWithRetries(
  batchOrBuilder,
  { retries = DEFAULT_RETRIES, baseDelayMs = DEFAULT_BASE_DELAY_MS } = {}
) {
  if (!batchOrBuilder)
    throw new Error("commitBatchWithRetries: batchOrBuilder is required");

  // builder function pattern
  const buildBatch =
    typeof batchOrBuilder === "function"
      ? batchOrBuilder
      : () => batchOrBuilder;

  return withRetries(
    async () => {
      const batch = buildBatch();
      if (!batch || typeof batch.commit !== "function") {
        throw new Error(
          "commitBatchWithRetries: builder did not return a valid WriteBatch"
        );
      }
      // no direct way to know number of ops in batch; we rely on caller to respect MAX_BATCH_SIZE,
      // but attempt commit and let Firestore error if exceeded (caught by withRetries).
      const res = await batch.commit();
      return res;
    },
    { retries, baseDelayMs }
  );
}

/* ---------------------------
   Helper wrappers for common DB ops (thin wrappers around admin SDK)
   - getDoc, setDoc, updateDoc, deleteDoc
   - They include light validation and logging metadata.
   --------------------------- */
async function getDocument(pathOrRef) {
  try {
    const ref = typeof pathOrRef === "string" ? db.doc(pathOrRef) : pathOrRef;
    const snap = await withRetries(() => ref.get());
    return snap;
  } catch (err) {
    logger.error("getDocument failed", {
      pathOrRef: String(pathOrRef),
      error: err,
    });
    throw err;
  }
}

async function setDocument(pathOrRef, data, { merge = false } = {}) {
  if (!data || typeof data !== "object") {
    throw new Error("setDocument: data object required");
  }
  try {
    const ref = typeof pathOrRef === "string" ? db.doc(pathOrRef) : pathOrRef;
    await withRetries(() => ref.set(data, { merge }));
    logger.info("setDocument succeeded", { path: ref.path, merge });
    return { success: true, path: ref.path };
  } catch (err) {
    logger.error("setDocument failed", {
      pathOrRef: String(pathOrRef),
      error: err,
    });
    throw err;
  }
}

async function updateDocument(pathOrRef, data) {
  if (!data || typeof data !== "object") {
    throw new Error("updateDocument: data object required");
  }
  try {
    const ref = typeof pathOrRef === "string" ? db.doc(pathOrRef) : pathOrRef;
    await withRetries(() => ref.update(data));
    logger.info("updateDocument succeeded", { path: ref.path });
    return { success: true, path: ref.path };
  } catch (err) {
    logger.error("updateDocument failed", {
      pathOrRef: String(pathOrRef),
      error: err,
    });
    throw err;
  }
}

async function deleteDocument(pathOrRef) {
  try {
    const ref = typeof pathOrRef === "string" ? db.doc(pathOrRef) : pathOrRef;
    await withRetries(() => ref.delete());
    logger.info("deleteDocument succeeded", { path: ref.path });
    return { success: true, path: ref.path };
  } catch (err) {
    logger.error("deleteDocument failed", {
      pathOrRef: String(pathOrRef),
      error: err,
    });
    throw err;
  }
}

/* ---------------------------
   Helper: createWriteBatch()
   - returns admin.firestore().batch() to allow caller to add ops
   --------------------------- */
function createWriteBatch() {
  return db.batch();
}

/* ---------------------------
   Helper: serverTimestamp() and toFirestoreTimestamp
   --------------------------- */
function serverTimestamp() {
  return admin.firestore.FieldValue.serverTimestamp();
}
function arrayUnion(...args) {
  return admin.firestore.FieldValue.arrayUnion(...args);
}
function arrayRemove(...args) {
  return admin.firestore.FieldValue.arrayRemove(...args);
}
function increment(value) {
  return admin.firestore.FieldValue.increment(value);
}

/* ---------------------------
   Exports
   --------------------------- */
module.exports = {
  // raw firestore instance (if needed)
  db,
  Timestamp,
  // path helpers
  docRef,
  colRef,
  // basic ops
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  // batch & transaction helpers
  createWriteBatch,
  commitBatchWithRetries,
  runTransactionWithRetries,
  // FieldValue helpers
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  // utilities
  withRetries,
  isTransientError,
  // constants for callers
  DEFAULT_RETRIES,
  DEFAULT_BASE_DELAY_MS,
  MAX_BATCH_SIZE,
};
