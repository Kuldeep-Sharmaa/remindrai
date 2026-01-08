// /**
//  * remindrClient.js
//  * ----------------
//  * Production-ready Firestore client for per-user reminders.
//  *
//  * Purpose:
//  *  - Centralized Firestore CRUD for reminders (per-user subcollection).
//  *  - Safe idempotent creation using a per-user "reminderIdempotency" mapping doc.
//  *  - Minimal reads: idempotent path reads only the mapping doc; non-idempotent path performs only a single setDoc.
//  *  - Optional resolveTimestamps flag to perform a single post-commit read when the caller needs server-resolved timestamps.
//  *  - Realtime subscription helper that exposes docChanges for diff-based updates.
//  *
//  * Contents:
//  *  - Path helpers: getUserRemindersCol, getIdempotencyDocRef
//  *  - Normalizer: normalizeSchedule
//  *  - Validation: validateMinimalPayload
//  *  - Document builder: buildDocData (omits undefined fields; injects role/tone/platform only for AI reminders)
//  *  - CRUD: addReminder (idempotent & non-idempotent), updateReminder, deleteReminder, getReminder, listUserReminders
//  *  - Realtime: subscribeToReminders (returns snapshot + docChanges)
//  *
//  * Invariants & guarantees:
//  *  - IF reminderType === "ai" -> content MAY include { role, tone, platform } only when present
//  *  - IF reminderType === "simple" -> content WILL NOT include role/tone/platform
//  *  - addReminder(idempotencyKey) reads exactly one mapping doc inside a transaction and writes mapping + reminder atomically
//  *  - listUserReminders enforces a default limit to avoid accidental large reads
//  *
//  * Recommended follow-ups:
//  *  * Inspect useReminderForm.js (client-side lazy activation) and scheduleUtils for computeNextRun logic.
//  */
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  runTransaction,
  limit as queryLimit,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../../../services/firebase"; // adjust path if needed
import scheduleUtils from "../utils/scheduleUtils";
import { IANAZone } from "luxon";

const USER_DOC = "users";
const REMINDERS_COL = "reminders";
const IDEMPOTENCY_COL = "reminderIdempotency";

// TTL for idempotency mapping (ms) - keep reasonably short (e.g., 30 days)
const IDEMPOTENCY_TTL_MS = 1000 * 60 * 60 * 24 * 30;

/* ---------------------------
   Path helpers
   --------------------------- */
function getUserRemindersCol(uid) {
  if (!uid) throw new Error("remindrClient: uid is required");
  return collection(db, USER_DOC, uid, REMINDERS_COL);
}
function getIdempotencyDocRef(uid, key) {
  if (!uid) throw new Error("remindrClient: uid is required for idempotency");
  if (!key) throw new Error("remindrClient: idempotencyKey is required");
  return doc(db, USER_DOC, uid, IDEMPOTENCY_COL, key);
}

/* ---------------------------
   Retry wrapper for transient errors
   --------------------------- */
async function withRetries(fn, { retries = 3, baseDelay = 150 } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const isRetryable = isTransientError(err);
      if (!isRetryable || attempt > retries) throw err;
      const jitter = Math.random() * 100;
      const delay = baseDelay * Math.pow(2, attempt - 1) + jitter;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

function isTransientError(err) {
  if (!err) return false;
  const code = String(err?.code || err?.status || "").toLowerCase();
  const msg = String(err?.message || "").toLowerCase();
  // common transient indications
  if (
    code.includes("429") ||
    code.includes("unavailable") ||
    code.includes("internal") ||
    code.includes("deadline") ||
    code.includes("aborted") ||
    code.includes("resource-exhausted")
  )
    return true;
  if (
    msg.includes("rate") ||
    msg.includes("unavailable") ||
    msg.includes("internal") ||
    msg.includes("deadline") ||
    msg.includes("aborted") ||
    msg.includes("resource exhausted")
  )
    return true;
  return false;
}

/* ---------------------------
   Schedule normalizer
   --------------------------- */
function normalizeSchedule(
  payloadSchedule = {},
  timezoneFallback = "UTC",
  frequency = "one_time"
) {
  const timezone =
    payloadSchedule?.timezone ||
    payloadSchedule?.tz ||
    timezoneFallback ||
    "UTC";

  // Accept canonical or legacy names
  const timeOfDay =
    payloadSchedule?.localTime ||
    payloadSchedule?.timeOfDay ||
    payloadSchedule?.time ||
    payloadSchedule?.timeLocal ||
    "09:00";

  const out = { timezone, timeOfDay };

  const date = payloadSchedule?.localDate || payloadSchedule?.date;
  if (date) out.date = date;

  const rawWd =
    payloadSchedule?.daysOfWeek ||
    payloadSchedule?.weekDays ||
    payloadSchedule?.weekdays ||
    null;
  if (frequency === "weekly" && Array.isArray(rawWd) && rawWd.length > 0) {
    out.weekDays = rawWd.slice(0, 7);
  }

  return out;
}

/* ---------------------------
   Minimal payload validator (throws)
   --------------------------- */
function validateMinimalPayload(payload) {
  if (!payload || typeof payload !== "object")
    throw new Error("addReminder: payload object required");
  if (!payload.ownerId)
    throw new Error("addReminder: payload.ownerId is required");
  if (!payload.frequency)
    throw new Error("addReminder: payload.frequency is required");
  if (!payload.schedule)
    throw new Error("addReminder: payload.schedule is required");
  if (!payload.reminderType)
    throw new Error(
      "addReminder: payload.reminderType is required ('AI'|'SIMPLE')"
    );
  const type = String(payload.reminderType).toLowerCase();
  if (!["ai", "simple"].includes(type))
    throw new Error(
      "addReminder: invalid reminderType (expected 'ai' or 'simple')"
    );
}

/* ---------------------------
   Safe trimming & caps for content fields
   - returns null for empty / non-strings to avoid storing empty strings
   --------------------------- */
function safeTrimString(v, maxLen = 2000) {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, maxLen);
  return s === "" ? null : s;
}

/* ---------------------------
   Helper: build normalized doc data (serverTimestamp placeholders)
   - Keeps document minimal: do not write undefined/null fields.
   - Accepts payload which may already include nextRunAtUTC_iso or nextRunUtc.
   --------------------------- */
function buildDocData(payload, schedule, idempotencyKey = null) {
  const baseDoc = {
    ownerId: payload.ownerId,
    reminderType:
      String(payload.reminderType).toLowerCase() === "ai" ? "ai" : "simple",
    frequency: payload.frequency,
    schedule,
    // nextRunAtUTC: prefer explicit ISO or null -> server/scheduler can recalc if null
    nextRunAtUTC: payload.nextRunAtUTC_iso || payload.nextRunUtc || null,
    enabled: typeof payload.enabled === "boolean" ? payload.enabled : true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    meta: {
      ...(idempotencyKey ? { idempotencyKey } : {}),
    },
  };

  if (baseDoc.reminderType === "ai") {
    const aiPrompt = safeTrimString(
      // prefer canonical content.aiPrompt, fallback to legacy prompt at root
      payload.content?.aiPrompt ?? payload.prompt ?? "",
      2000
    );

    const content = {};
    if (aiPrompt) content.aiPrompt = aiPrompt;

    // --- FIX: read brand context from either payload.content.* OR payload.* (backwards compatible)
    const tone = safeTrimString(payload.content?.tone ?? payload.tone, 100);
    const platform = safeTrimString(
      payload.content?.platform ?? payload.platform,
      50
    );
    const role = safeTrimString(payload.content?.role ?? payload.role, 100);

    if (tone) content.tone = tone;
    if (platform) content.platform = platform;
    if (role) content.role = role;

    return { ...baseDoc, content };
  }

  // Simple reminder: keep minimal - do not include brand context
  const message = safeTrimString(
    payload.content?.message ?? payload.message ?? "",
    2000
  );

  const content = {};
  if (message) content.message = message;

  const title = safeTrimString(payload.title, 200);
  const notes = safeTrimString(payload.notes, 2000);

  if (title) content.title = title;
  if (notes) content.notes = notes;

  return { ...baseDoc, content };
}

/* ---------------------------
   addReminder(payload, { idempotencyKey, resolveTimestamps = false } = {})
   - Default returns optimistic doc (no post-commit read).
   - Use resolveTimestamps=true to return serverTimestamp-resolved document.
   --------------------------- */
export async function addReminder(
  payload,
  { idempotencyKey = null, resolveTimestamps = false } = {}
) {
  validateMinimalPayload(payload);

  const uid = payload.ownerId;
  const colRef = getUserRemindersCol(uid);

  // Defensive schedule normalization
  const schedule = normalizeSchedule(
    payload.schedule,
    payload.timezoneAtCreation || "UTC",
    payload.frequency
  );

  // Compute nextRun if missing (best-effort)
  let computedNextRunIso = null;
  try {
    if (payload.nextRunAtUTC_iso || payload.nextRunUtc) {
      computedNextRunIso = payload.nextRunAtUTC_iso || payload.nextRunUtc;
    } else {
      computedNextRunIso = scheduleUtils.computeNextRunFromSchedule({
        frequency: payload.frequency,
        schedule,
      });
    }
  } catch (e) {
    computedNextRunIso = null;
  }

  if (computedNextRunIso) {
    // keep both iso and Date for caller convenience (doc will contain Date object)
    payload.nextRunAtUTC_iso = computedNextRunIso;
    payload.nextRunAtUTC = new Date(computedNextRunIso);
  }

  const docData = buildDocData(payload, schedule, idempotencyKey);

  // ---------------------------
  // Idempotent transaction (reads only mapping doc)
  // ---------------------------
  if (idempotencyKey) {
    const idempoRef = getIdempotencyDocRef(uid, idempotencyKey);

    try {
      const txResult = await withRetries(
        () =>
          runTransaction(db, async (tx) => {
            // Read only the mapping doc to decide idempotency
            const idempoSnap = await tx.get(idempoRef);

            if (idempoSnap.exists()) {
              const existing = idempoSnap.data();
              if (existing?.reminderId) {
                // mapping exists -> return mapping and avoid duplicate writes
                return { idempotent: true, reminderId: existing.reminderId };
              }
              // mapping exists but missing reminderId -> we'll overwrite mapping
            }

            // create new doc with generated id and mapping, avoid reading reminder doc inside tx
            const newReminderRef = doc(colRef);
            tx.set(newReminderRef, docData);

            // set TTL-aware expiresAt for idempotency mapping to allow automatic cleanup (client-side Date)
            const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MS);

            tx.set(idempoRef, {
              reminderId: newReminderRef.id,
              createdAt: serverTimestamp(),
              expiresAt,
            });

            return { idempotent: false, reminderId: newReminderRef.id };
          }),
        { retries: 3, baseDelay: 150 }
      );

      if (txResult && txResult.reminderId) {
        const createdId = txResult.reminderId;

        if (resolveTimestamps) {
          const createdDocRef = doc(getUserRemindersCol(uid), createdId);
          const snap = await getDoc(createdDocRef);
          if (snap.exists()) {
            return {
              id: snap.id,
              ...snap.data(),
              idempotent: txResult.idempotent === true,
            };
          }
        }

        // optimistic return (no extra read)
        return {
          id: txResult.reminderId,
          ...docData,
          idempotent: txResult.idempotent === true,
        };
      }

      return { idempotent: true };
    } catch (err) {
      console.error("addReminder (transaction) error:", err);
      throw err;
    }
  }

  // ---------------------------
  // Non-idempotent: single write with generated id
  // --------------------------- */
  try {
    const docRef = doc(colRef);
    await setDoc(docRef, docData);

    if (resolveTimestamps) {
      const snap = await getDoc(docRef);
      if (snap.exists()) return { id: snap.id, ...snap.data() };
    }

    return { id: docRef.id, ...docData };
  } catch (err) {
    console.error("addReminder error (setDoc):", err);
    throw err;
  }
}

/* ---------------------------
   updateReminder(uid, reminderId, updates)
   - merges updates; recomputes nextRun when schedule/frequency change
   --------------------------- */
export async function updateReminder(uid, reminderId, updates = {}) {
  if (!uid) throw new Error("updateReminder: uid is required");
  if (!reminderId) throw new Error("updateReminder: reminderId is required");
  if (!updates || typeof updates !== "object")
    throw new Error("updateReminder: updates object required");

  const reminderDocRef = doc(getUserRemindersCol(uid), reminderId);

  let computedNextRun = null;
  try {
    if (updates.schedule || updates.frequency) {
      const scheduleInput = updates.schedule || {};
      const frequencyForNormalize = updates.frequency || "one_time";
      const schedule = normalizeSchedule(
        scheduleInput,
        updates.timezoneAtCreation || scheduleInput.timezone || "UTC",
        frequencyForNormalize
      );

      try {
        computedNextRun = scheduleUtils.computeNextRunFromSchedule({
          frequency: frequencyForNormalize,
          schedule,
        });
      } catch (e) {
        computedNextRun = null;
      }

      updates = { ...updates, schedule };
    }
  } catch (e) {
    computedNextRun = null;
  }

  const payload = {
    ...updates,
    ...(computedNextRun ? { nextRunAtUTC: new Date(computedNextRun) } : {}),
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(reminderDocRef, payload);
    // return final snapshot (one read) for API parity and resolved timestamps
    const snap = await getDoc(reminderDocRef);
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return { id: reminderId, ...payload };
  } catch (err) {
    console.error("updateReminder error:", err);
    throw err;
  }
}

/* ---------------------------
   deleteReminder
   --------------------------- */
/* ---------------------------
   deleteReminder (deletes reminder + related idempotency mapping docs)
   --------------------------- */
export async function deleteReminder(uid, reminderId) {
  if (!uid) throw new Error("deleteReminder: uid is required");
  if (!reminderId) throw new Error("deleteReminder: reminderId is required");

  try {
    const reminderDocRef = doc(getUserRemindersCol(uid), reminderId);

    // 1) Find any idempotency mapping docs referencing this reminderId
    const idempoColRef = collection(db, USER_DOC, uid, IDEMPOTENCY_COL);
    const idempoQuery = query(
      idempoColRef,
      where("reminderId", "==", reminderId)
    );
    const idempoSnap = await getDocs(idempoQuery);

    // 2) Use a batch to delete the reminder doc + any found mapping docs
    const batch = writeBatch(db);

    // delete mapping docs (if any)
    idempoSnap.forEach((docSnap) => {
      batch.delete(doc(db, USER_DOC, uid, IDEMPOTENCY_COL, docSnap.id));
    });

    // delete reminder doc
    batch.delete(reminderDocRef);

    // commit batch
    await batch.commit();

    return { success: true, id: reminderId, mappingsDeleted: idempoSnap.size };
  } catch (err) {
    console.error("deleteReminder error:", err);
    throw err;
  }
}

/* ---------------------------
   getReminder
   --------------------------- */
export async function getReminder(uid, reminderId) {
  if (!uid) throw new Error("getReminder: uid is required");
  if (!reminderId) throw new Error("getReminder: reminderId is required");

  try {
    const reminderDocRef = doc(getUserRemindersCol(uid), reminderId);
    const snap = await getDoc(reminderDocRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error("getReminder error:", err);
    throw err;
  }
}

/* ---------------------------
   listUserReminders (one-time)
   - IMPORTANT: prefer caller-side pagination. This helper enforces a default limit.
   --------------------------- */
export async function listUserReminders(uid, { limit = 100 } = {}) {
  if (!uid) throw new Error("listUserReminders: uid is required");

  try {
    const colRef = getUserRemindersCol(uid);
    const q = query(
      colRef,
      orderBy("nextRunAtUTC", "asc"),
      orderBy("createdAt", "desc"),
      queryLimit(limit)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("listUserReminders error:", err);
    throw err;
  }
}

/* ---------------------------
   subscribeToReminders (realtime)
   - Returns snapshot + docChanges for diff-based processing by caller
   --------------------------- */
export function subscribeToReminders(uid, callback) {
  if (!uid) throw new Error("subscribeToReminders: uid is required");
  if (typeof callback !== "function")
    throw new Error("subscribeToReminders: callback must be a function");

  const colRef = getUserRemindersCol(uid);
  const q = query(
    colRef,
    orderBy("nextRunAtUTC", "asc"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      try {
        const meta = {
          size: snapshot.size,
          readTime: snapshot.readTime,
        };
        // give the raw snapshot and changes to caller so they can apply diffs / incremental updates
        callback({ snapshot, changes: snapshot.docChanges(), meta });
      } catch (e) {
        console.error("subscribeToReminders callback error:", e);
      }
    },
    (err) => {
      console.error("subscribeToReminders snapshot error:", err);
      try {
        callback({ snapshot: null, changes: [], error: err });
      } catch (e) {
        /* no-op */
      }
    }
  );

  return unsubscribe;
}

/* ---------------------------
   recomputeRemindersForUserTimezone (client-side)
   - uid: user id
   - targetTz: IANA timezone to switch to
   - options: {
       maxClientCount = 5,
       batchSize = 50,
       limit = 500, // max reminders to fetch (safety)
       progressCb: (processed, total) => void,
     }
   Returns: { status, runId, processed, total, rollbackSnapshot (array), error }
--------------------------- */
export async function recomputeRemindersForUserTimezone(
  uid,
  targetTz,
  { maxClientCount = 5, batchSize = 50, limit = 500, progressCb = null } = {}
) {
  if (!uid)
    throw new Error("recomputeRemindersForUserTimezone: uid is required");
  if (!targetTz)
    throw new Error("recomputeRemindersForUserTimezone: targetTz is required");

  if (!IANAZone.isValidZone(targetTz)) {
    return { status: "error", error: "Invalid target timezone" };
  }

  // generate run id for idempotency/audit
  const runId =
    (typeof crypto !== "undefined" &&
      crypto?.randomUUID &&
      crypto.randomUUID()) ||
    `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    // 1) fetch reminders (bounded)
    const reminders = await listUserReminders(uid, { limit });
    const total = Array.isArray(reminders) ? reminders.length : 0;

    if (!Array.isArray(reminders) || reminders.length === 0) {
      return {
        status: "ok",
        runId,
        processed: 0,
        total: 0,
        rollbackSnapshot: [],
      };
    }

    // If too many reminders for client, let caller know to queue server-side
    if (total > maxClientCount) {
      return { status: "queued", runId, processed: 0, total };
    }

    // prepare batches
    const batches = [];
    let currentBatch = [];
    for (const r of reminders) {
      currentBatch.push(r);
      if (currentBatch.length >= batchSize) {
        batches.push(currentBatch);
        currentBatch = [];
      }
    }
    if (currentBatch.length) batches.push(currentBatch);

    // rollback snapshot (compact)
    const rollbackSnapshot = []; // { id, oldSchedule, oldNextRunAtUTC }
    let processed = 0;

    // Function to create an update object for a reminder
    function makeUpdateForReminder(rem) {
      const reminderId = rem.id;
      const freq = rem.frequency || "one_time";
      const schedule = rem.schedule || {};
      const origNextIso = rem.nextRunAtUTC
        ? // support stored as Date or ISO
          rem.nextRunAtUTC instanceof Date
          ? rem.nextRunAtUTC.toISOString()
          : String(rem.nextRunAtUTC)
        : rem.nextRunAtUTC_iso || rem.nextRunUtc || null;

      // compute mapped ISO
      const newIso = scheduleUtils.computeNextRunAfterTimezoneChange(
        { frequency: freq, schedule },
        origNextIso,
        schedule?.timezone || null,
        targetTz
      );

      const updates = {
        updatedAt: serverTimestamp(),
        // we prefer to update the whole schedule object to avoid nested dot path issues in some rules
        schedule: {
          ...(schedule || {}),
          timezone: targetTz,
        },
        meta: {
          ...(rem.meta || {}),
          timezoneChangeRunId: runId,
        },
      };

      if (newIso) {
        // Firestore stores Date objects for timestamp fields in your codebase
        updates.nextRunAtUTC = new Date(newIso);
      } else {
        // If newIso couldn't be computed, do not overwrite nextRunAtUTC — just update timezone
        // (keeps reminder safe; server later can recompute)
      }

      return {
        reminderId,
        updates,
        oldSchedule: schedule,
        oldNextRunAtUTC: origNextIso,
      };
    }

    // 2) Apply batches sequentially to avoid large write spikes
    for (const batchGroup of batches) {
      const batch = writeBatch(db);
      const perBatchUpdates = [];
      for (const rem of batchGroup) {
        const { reminderId, updates, oldSchedule, oldNextRunAtUTC } =
          makeUpdateForReminder(rem);
        // prepare doc ref
        const ref = doc(getUserRemindersCol(uid), reminderId);
        // Use set with merge to avoid overwriting unexpected extra fields; update could fail if field absent
        batch.update(ref, updates);
        perBatchUpdates.push({ reminderId, oldSchedule, oldNextRunAtUTC });
      }

      // commit batch with retries wrapper for transient errors
      try {
        await withRetries(() => batch.commit(), { retries: 3, baseDelay: 200 });
        // on success, append to rollback snapshot and update progress
        rollbackSnapshot.push(...perBatchUpdates);
        processed += perBatchUpdates.length;
        if (typeof progressCb === "function") {
          try {
            progressCb(processed, total);
          } catch (e) {
            // ignore progress cb errors
            console.warn("recompute: progressCb threw", e);
          }
        }
      } catch (batchErr) {
        // On first failure attempt rollback of already committed batches
        console.error(
          "recomputeRemindersForUserTimezone: batch commit failed:",
          batchErr
        );
        // attempt rollback for processed items
        try {
          if (rollbackSnapshot.length) {
            const rbBatch = writeBatch(db);
            for (const rb of rollbackSnapshot) {
              const ref = doc(getUserRemindersCol(uid), rb.reminderId);
              const rollbackUpdates = {
                updatedAt: serverTimestamp(),
                schedule: rb.oldSchedule || {},
                meta: {
                  ...(rb.oldSchedule?.meta || {}),
                },
              };
              if (rb.oldNextRunAtUTC) {
                rollbackUpdates.nextRunAtUTC = new Date(rb.oldNextRunAtUTC);
              } else {
                rollbackUpdates.nextRunAtUTC = null;
              }
              rbBatch.update(ref, rollbackUpdates);
            }
            await withRetries(() => rbBatch.commit(), {
              retries: 2,
              baseDelay: 150,
            });
          }
        } catch (rbErr) {
          console.error(
            "recomputeRemindersForUserTimezone: rollback failed:",
            rbErr
          );
        }

        return {
          status: "error",
          runId,
          processed,
          total,
          rollbackSnapshot,
          error: String(batchErr?.message || batchErr),
        };
      }
    }

    // Completed all batches successfully
    return {
      status: "ok",
      runId,
      processed,
      total,
      rollbackSnapshot,
    };
  } catch (err) {
    console.error("recomputeRemindersForUserTimezone error:", err);
    return {
      status: "error",
      runId,
      processed: 0,
      total: 0,
      rollbackSnapshot: [],
      error: String(err?.message || err),
    };
  }
}

/* ---------------------------
   Default export
   --------------------------- */
const defaultExport = {
  addReminder,
  updateReminder,
  deleteReminder,
  getReminder,
  listUserReminders,
  subscribeToReminders,
  recomputeRemindersForUserTimezone,
};

export default defaultExport;
