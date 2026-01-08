// Centralized storage helpers for timezone decline tracking and retry queue.

export const TZ_QUEUE_KEY = "remindrai_pending_timezone_update_v2";
export const TZ_ACCEPTED_KEY = "remindrai_timezone_accepted_broadcast";
export const TZ_DECLINED_KEY = "remindrai_declined_timezones_v1";

export const QUEUE_SCHEMA_VERSION = 1;
export const MAX_QUEUE_ITEMS = 20;
export const MAX_QUEUE_ATTEMPTS = 5;
export const DECLINE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export function readDeclinedMap() {
  try {
    const raw = localStorage.getItem(TZ_DECLINED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
    return {};
  } catch (e) {
    console.warn("readDeclinedMap: parse error, resetting declined map", e);
    return {};
  }
}

export function writeDeclinedMap(map) {
  try {
    localStorage.setItem(TZ_DECLINED_KEY, JSON.stringify(map || {}));
  } catch (e) {
    console.warn("writeDeclinedMap: storage error", e);
  }
}

export function makeDeclineKey(uid, tz) {
  return `${uid}::${tz}`;
}

export function markDeclinedLocal(uid, tz) {
  if (!uid || !tz) return;
  const key = makeDeclineKey(uid, tz);
  const m = readDeclinedMap();
  m[key] = Date.now();
  writeDeclinedMap(m);
}

export function clearDeclinedLocal(uid, tz) {
  if (!uid || !tz) return;
  try {
    const m = readDeclinedMap();
    const key = makeDeclineKey(uid, tz);
    if (m[key]) {
      delete m[key];
      writeDeclinedMap(m);
      console.log(`[clearDeclinedLocal] Cleared declined mark for ${key}`);
    }
  } catch (e) {
    console.warn("clearDeclinedLocal: error", e);
  }
}

export function clearAllDeclinedForUser(uid) {
  if (!uid) return;
  try {
    const m = readDeclinedMap();
    let changed = false;
    Object.keys(m).forEach((key) => {
      if (key.startsWith(`${uid}::`)) {
        delete m[key];
        changed = true;
      }
    });
    if (changed) {
      writeDeclinedMap(m);
      console.log(
        `[clearAllDeclinedForUser] Cleared all declined marks for user ${uid}`
      );
    }
  } catch (e) {
    console.warn("clearAllDeclinedForUser: error", e);
  }
}

export function isDeclinedLocal(uid, tz) {
  if (!uid || !tz) return false;
  const key = makeDeclineKey(uid, tz);
  const m = readDeclinedMap();

  let changed = false;
  Object.keys(m).forEach((k) => {
    if (Date.now() - (m[k] || 0) > DECLINE_TTL_MS) {
      delete m[k];
      changed = true;
    }
  });
  if (changed) writeDeclinedMap(m);

  const ts = m[key];
  if (!ts) return false;
  if (Date.now() - ts > DECLINE_TTL_MS) {
    delete m[key];
    writeDeclinedMap(m);
    return false;
  }
  return true;
}

export function readQueueMap() {
  try {
    const raw = localStorage.getItem(TZ_QUEUE_KEY);
    if (!raw) return { schema: QUEUE_SCHEMA_VERSION, items: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.schema !== QUEUE_SCHEMA_VERSION) {
      console.warn("readQueueMap: schema mismatch or invalid, resetting queue");
      return { schema: QUEUE_SCHEMA_VERSION, items: {} };
    }
    return parsed;
  } catch (e) {
    console.warn("readQueueMap: parse error, resetting queue");
    return { schema: QUEUE_SCHEMA_VERSION, items: {} };
  }
}

export function writeQueueMap(map) {
  try {
    localStorage.setItem(TZ_QUEUE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("writeQueueMap error:", e);
  }
}

export function makeQueueKey(uid, tz) {
  return `${uid}::${tz}`;
}


