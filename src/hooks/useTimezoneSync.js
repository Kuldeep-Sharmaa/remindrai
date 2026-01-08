import { useState, useEffect, useCallback, useRef } from "react";
import { IANAZone } from "luxon";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useTimezoneDetection } from "./useTimezoneDetection";
import remindrClient from "../features/remindersystem/services/remindrClient";
import {
  TZ_ACCEPTED_KEY,
  TZ_DECLINED_KEY,
  markDeclinedLocal,
  clearDeclinedLocal,
  isDeclinedLocal,
  readQueueMap,
  writeQueueMap,
  makeQueueKey,
} from "../context/timezoneStorage";

/**
 * @typedef {Object} TimezoneSyncParams
 * @property {import("firebase/auth").User | null} firebaseUser
 * @property {import("../context/AuthContext").UserProfile | null} userProfile
 * @property {number} [totalReminders]
 * @property {boolean} hasLoadedProfile
 * @property {boolean} loading
 * @property {Function} setUserProfile
 */

/**
 * @typedef {Object} TimezoneSyncState
 * @property {string | null} detectedTimezone
 * @property {boolean} isStable
 * @property {string | null} pendingDeviceTimezone
 * @property {string | null} pendingOriginalTimezone
 * @property {(data: {originalTimezone?: string, deviceTimezone: string}) => void} stageDeviceTimezone
 * @property {() => void} declineDeviceTimezone
 * @property {(options: Object) => Promise<Object>} acceptDeviceTimezone
 * @property {() => void} resetTimezoneState
 * @property {(isLoggingOut: boolean) => void} markLogout
 */

const MAX_CLIENT_RECOMPUTE_COUNT = 5;
const RECOMPUTE_BATCH_SIZE = 50;
const ENABLE_REMINDER_RECOMPUTE = false;
const MAX_QUEUE_ATTEMPTS = 5;

function reportError(err, context = {}) {
  try {
    const last = {
      ts: Date.now(),
      message: String(err?.message || err),
      context,
    };
    localStorage.setItem("remindrai_last_error", JSON.stringify(last));
  } catch (e) {
    /* swallow */
  }
  console.error("reportError:", err, context);
}

function generateClientId() {
  try {
    let id = sessionStorage.getItem("remindrai_client_id");
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      sessionStorage.setItem("remindrai_client_id", id);
    }
    return id;
  } catch (e) {
    return `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }
}

function makeOpId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function enqueueTimezoneUpdate(uid, tz) {
  if (!uid || !tz) return;
  try {
    if (!IANAZone.isValidZone(tz)) {
      console.warn("enqueueTimezoneUpdate: invalid timezone skipped:", tz);
      return;
    }

    const map = readQueueMap();
    const key = makeQueueKey(uid, tz);
    const items = map.items || {};
    items[key] = {
      uid,
      tz,
      ts: Date.now(),
      attempts: 0,
      clientId: generateClientId(),
      opId: makeOpId(),
    };

    const keys = Object.keys(items);
    if (keys.length > 20) {
      const sorted = keys
        .map((k) => ({ k, ts: items[k].ts || 0 }))
        .sort((a, b) => a.ts - b.ts);
      const toRemove = sorted.slice(0, keys.length - 20);
      toRemove.forEach((r) => delete items[r.k]);
      console.log(
        `enqueueTimezoneUpdate: trimmed ${toRemove.length} old items from queue`
      );
    }

    map.items = items;
    writeQueueMap(map);
    console.log("📦 enqueueTimezoneUpdate: queued", uid, tz);
  } catch (e) {
    reportError(e, { fn: "enqueueTimezoneUpdate", uid, tz });
  }
}

async function flushTimezoneQueue({ rateLimitMs = 250 } = {}) {
  try {
    const map = readQueueMap();
    const items = map.items || {};
    const keys = Object.keys(items);
    if (!keys.length) return { successKeys: [], successItems: [], failed: [] };

    const successKeys = [];
    const successItems = [];
    const failed = [];

    const currentUser = auth.currentUser;
    const currentUid = currentUser?.uid;

    if (!currentUid) {
      console.log("flushTimezoneQueue: no authenticated user, skipping flush");
      return { successKeys: [], successItems: [], failed: [] };
    }

    for (const key of keys) {
      const item = items[key];
      if (!item || !item.uid || !item.tz) {
        delete items[key];
        continue;
      }

      if (item.uid !== currentUid) {
        console.log(
          `flushTimezoneQueue: skipping item for different user (current: ${currentUid}, item: ${item.uid})`
        );
        continue;
      }

      if ((item.attempts || 0) >= MAX_QUEUE_ATTEMPTS) {
        failed.push({
          key,
          item,
          error: `max attempts (${MAX_QUEUE_ATTEMPTS}) reached`,
        });
        item.permanentFailure = true;
        items[key] = item;
        continue;
      }

      if (rateLimitMs) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, rateLimitMs));
      }

      try {
        const userRef = doc(db, "users", item.uid);
        // eslint-disable-next-line no-await-in-loop
        await setDoc(
          userRef,
          {
            timezone: item.tz,
            isAutoTimezone: true,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        delete items[key];
        successKeys.push(key);
        successItems.push({
          uid: item.uid,
          tz: item.tz,
          opId: item.opId,
        });

        clearDeclinedLocal(item.uid, item.tz);

        try {
          localStorage.setItem(
            TZ_ACCEPTED_KEY,
            JSON.stringify({
              uid: item.uid,
              tz: item.tz,
              opId: item.opId,
              ts: Date.now(),
            })
          );
        } catch (e) {
          /* ignore */
        }

        console.log("✅ flushTimezoneQueue: flushed", item.uid, item.tz);
      } catch (err) {
        item.attempts = (item.attempts || 0) + 1;
        item.lastAttemptTs = Date.now();

        const code = String(err?.code || err?.status || "").toLowerCase();
        const msg = String(err?.message || "").toLowerCase();
        const isPermanent =
          code.includes("permission") ||
          code.includes("unauth") ||
          code.includes("forbidden") ||
          msg.includes("permission") ||
          msg.includes("not-found");

        if (isPermanent) {
          item.permanentFailure = true;
          reportError(err, { fn: "flushTimezoneQueue_permission", key, item });
          console.warn(
            "flushTimezoneQueue: permanent failure for queued item, marking as permanent",
            key,
            err
          );
        } else {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) =>
            setTimeout(r, Math.min(2000 * item.attempts, 15000))
          );
        }

        items[key] = item;
        failed.push({ key, item, error: String(err?.message || err) });
      }
    }

    map.items = items;
    writeQueueMap(map);

    return { successKeys, successItems, failed };
  } catch (e) {
    reportError(e, { fn: "flushTimezoneQueue_top" });
    return {
      successKeys: [],
      successItems: [],
      failed: [{ key: null, item: null, error: String(e) }],
    };
  }
}

export default function useTimezoneSync({
  firebaseUser,
  userProfile,
  totalReminders,
  hasLoadedProfile,
  loading,
  setUserProfile,
}) {
  const [pendingDeviceTimezone, setPendingDeviceTimezone] = useState(null);
  const [pendingOriginalTimezone, setPendingOriginalTimezone] = useState(null);
  const timezoneUpdateInProgressRef = useRef(false);
  const lastSyncedTimezoneRef = useRef(null);
  const isLoggingOutRef = useRef(false);

  const { detectedTimezone, isStable } = useTimezoneDetection({
    stabilityWindowMs: 15000,
  });

  const stageDeviceTimezone = useCallback(
    ({ originalTimezone, deviceTimezone } = {}) => {
      if (!deviceTimezone) return;
      if (userProfile?.timezone === deviceTimezone) return;

      if (isDeclinedLocal(userProfile?.uid, deviceTimezone)) {
        console.info(
          "[useTimezoneSync] Detected TZ previously declined (local), skipping modal:",
          deviceTimezone
        );
        return;
      }

      if (pendingDeviceTimezone === deviceTimezone) {
        console.debug(
          "[useTimezoneSync] pendingDeviceTimezone already staged:",
          deviceTimezone
        );
        return;
      }

      setPendingOriginalTimezone(
        originalTimezone || userProfile?.timezone || null
      );
      setPendingDeviceTimezone(deviceTimezone);
      console.log(
        "[useTimezoneSync] Staging confirmation modal for device timezone:",
        deviceTimezone,
        "original:",
        originalTimezone || userProfile?.timezone
      );
    },
    [pendingDeviceTimezone, userProfile]
  );

  const declineDeviceTimezone = useCallback(() => {
    if (pendingDeviceTimezone && firebaseUser?.uid) {
      markDeclinedLocal(firebaseUser.uid, pendingDeviceTimezone);
      console.log(
        `[useTimezoneSync] Declined device TZ ${pendingDeviceTimezone} (local)`
      );
    }
    setPendingDeviceTimezone(null);
    setPendingOriginalTimezone(null);
  }, [pendingDeviceTimezone, firebaseUser?.uid]);

  const acceptDeviceTimezone = useCallback(
    async ({
      newTimezone,
      persistToProfile = true,
      runClientRecompute = true,
      progressCb = null,
    } = {}) => {
      if (!firebaseUser?.uid) {
        const msg = "No authenticated user";
        console.warn("acceptDeviceTimezone:", msg);
        return { status: "error", error: msg };
      }
      if (!newTimezone) {
        const msg = "newTimezone is required";
        console.warn("acceptDeviceTimezone:", msg);
        return { status: "error", error: msg };
      }

      if (!IANAZone.isValidZone(newTimezone)) {
        return { status: "error", error: "Invalid timezone" };
      }

      if (timezoneUpdateInProgressRef.current) {
        const msg = "Timezone update already in progress";
        console.warn("acceptDeviceTimezone:", msg);
        return { status: "error", error: msg };
      }

      timezoneUpdateInProgressRef.current = true;

      const prevSynced = lastSyncedTimezoneRef.current;
      const prevProfileTz = userProfile?.timezone || null;

      try {
        if (!navigator.onLine) {
          enqueueTimezoneUpdate(firebaseUser.uid, newTimezone);
          setPendingDeviceTimezone(null);
          setPendingOriginalTimezone(null);
          return { status: "queued", queuedForServer: true };
        }

        if (persistToProfile) {
          const userRef = doc(db, "users", firebaseUser.uid);
          try {
            await setDoc(
              userRef,
              {
                timezone: newTimezone,
                isAutoTimezone: true,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
            console.log(
              `acceptDeviceTimezone: timezone written to profile: ${newTimezone}`
            );

            setUserProfile((prev) => ({
              ...(prev || {}),
              timezone: newTimezone,
              isAutoTimezone: true,
            }));

            lastSyncedTimezoneRef.current = newTimezone;
            clearDeclinedLocal(firebaseUser.uid, newTimezone);
          } catch (writeErr) {
            lastSyncedTimezoneRef.current = prevSynced;
            enqueueTimezoneUpdate(firebaseUser.uid, newTimezone);

            stageDeviceTimezone({
              originalTimezone: prevProfileTz,
              deviceTimezone: newTimezone,
            });

            console.error(
              "acceptDeviceTimezone: failed to write profile, enqueued and re-staged:",
              writeErr
            );
            return {
              status: "queued",
              queuedForServer: true,
              error: String(writeErr?.message || writeErr),
            };
          }
        }

        setPendingDeviceTimezone(null);
        setPendingOriginalTimezone(null);

        const count = Number(totalReminders || 0);

        if (!runClientRecompute) {
          return {
            status: "ok",
            runId: null,
            processed: 0,
            queuedForServer: false,
          };
        }

        if (count > MAX_CLIENT_RECOMPUTE_COUNT) {
          if (ENABLE_REMINDER_RECOMPUTE) {
            try {
              const qRef = doc(db, "recompute_queue", firebaseUser.uid);
              await setDoc(
                qRef,
                {
                  uid: firebaseUser.uid,
                  newTimezone,
                  requestedAt: serverTimestamp(),
                  status: "pending",
                  requester: "client",
                },
                { merge: true }
              );
              console.log(
                "acceptDeviceTimezone: queued recompute for server (too many reminders)"
              );
              return { status: "queued", queuedForServer: true };
            } catch (qErr) {
              console.error(
                "acceptDeviceTimezone: failed to write queue doc:",
                qErr
              );
              return { status: "error", error: String(qErr?.message || qErr) };
            }
          } else {
            console.log(
              "acceptDeviceTimezone: server recompute disabled, returning queued status"
            );
            return { status: "queued", queuedForServer: true };
          }
        }

        if (
          remindrClient &&
          typeof remindrClient.recomputeRemindersForUserTimezone === "function"
        ) {
          try {
            const res = await remindrClient.recomputeRemindersForUserTimezone(
              firebaseUser.uid,
              newTimezone,
              {
                maxClientCount: MAX_CLIENT_RECOMPUTE_COUNT,
                batchSize: RECOMPUTE_BATCH_SIZE,
                progressCb,
              }
            );

            if (res && res.status === "ok") {
              console.log(
                "acceptDeviceTimezone: client recompute completed",
                res
              );
              return {
                status: "ok",
                runId: res.runId,
                processed: res.processed,
                queuedForServer: false,
              };
            }

            if (res && res.status === "queued") {
              console.log(
                "acceptDeviceTimezone: recompute queued for server by helper"
              );
              return {
                status: "queued",
                runId: res.runId,
                queuedForServer: true,
              };
            }

            console.warn(
              "acceptDeviceTimezone: recompute returned unexpected result",
              res
            );
            return {
              status: "error",
              error: "Recompute returned unexpected result",
              details: res,
            };
          } catch (recomputeErr) {
            console.error(
              "acceptDeviceTimezone: client recompute failed:",
              recomputeErr
            );
            if (ENABLE_REMINDER_RECOMPUTE) {
              try {
                const qRef = doc(db, "recompute_queue", firebaseUser.uid);
                await setDoc(
                  qRef,
                  {
                    uid: firebaseUser.uid,
                    newTimezone,
                    requestedAt: serverTimestamp(),
                    status: "pending",
                    requester: "client",
                    error: String(recomputeErr?.message || recomputeErr),
                  },
                  { merge: true }
                );
                console.log(
                  "acceptDeviceTimezone: recompute failed - queued job for server"
                );
                return {
                  status: "queued",
                  queuedForServer: true,
                  error: String(recomputeErr?.message || recomputeErr),
                };
              } catch (qErr2) {
                console.error(
                  "acceptDeviceTimezone: failed to queue after recompute error:",
                  qErr2
                );
                return {
                  status: "error",
                  error: String(recomputeErr?.message || recomputeErr),
                };
              }
            } else {
              return {
                status: "error",
                error: String(recomputeErr?.message || recomputeErr),
              };
            }
          }
        }

        return {
          status: "ok",
          runId: null,
          processed: 0,
          queuedForServer: false,
        };
      } finally {
        timezoneUpdateInProgressRef.current = false;
      }
    },
    [
      firebaseUser,
      totalReminders,
      userProfile?.timezone,
      stageDeviceTimezone,
      setUserProfile,
    ]
  );

  useEffect(() => {
    let running = false;
    const handleOnline = async () => {
      if (running) return;
      running = true;
      try {
        console.log("🌐 Connection restored, flushing timezone queue...");
        await new Promise((r) => setTimeout(r, Math.random() * 800));
        const res = await flushTimezoneQueue({ rateLimitMs: 200 });

        if (res.successItems && res.successItems.length > 0) {
          res.successItems.forEach((successItem) => {
            lastSyncedTimezoneRef.current = successItem.tz;
            clearDeclinedLocal(successItem.uid, successItem.tz);

            if (
              firebaseUser?.uid === successItem.uid &&
              pendingDeviceTimezone === successItem.tz
            ) {
              setPendingDeviceTimezone(null);
              setPendingOriginalTimezone(null);
              console.log(
                "[useTimezoneSync] Same-tab: cleared pending modal after flush:",
                successItem.tz
              );
            }
          });
        }

        if (res.failed && res.failed.length) {
          reportError(new Error("flushTimezoneQueue had failures"), {
            failed: res.failed,
          });
        }
      } catch (e) {
        reportError(e, { fn: "handleOnline" });
      } finally {
        running = false;
      }
    };

    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [firebaseUser?.uid, pendingDeviceTimezone]);

  useEffect(() => {
    if (!hasLoadedProfile) {
      return;
    }

    if (!isStable) {
      return;
    }

    if (!detectedTimezone) {
      return;
    }

    if (!firebaseUser?.uid || loading || isLoggingOutRef.current) {
      return;
    }

    const isAuto = userProfile?.isAutoTimezone !== false;
    if (!isAuto) {
      return;
    }

    if (!userProfile?.timezone) {
      return;
    }

    const profileTz = userProfile.timezone;
    if (profileTz === detectedTimezone) {
      lastSyncedTimezoneRef.current = profileTz;
      return;
    }

    if (lastSyncedTimezoneRef.current === detectedTimezone) {
      return;
    }

    if (isDeclinedLocal(firebaseUser.uid, detectedTimezone)) {
      return;
    }

    if (timezoneUpdateInProgressRef.current) {
      return;
    }

    stageDeviceTimezone({
      originalTimezone: profileTz,
      deviceTimezone: detectedTimezone,
    });
  }, [
    hasLoadedProfile,
    detectedTimezone,
    isStable,
    firebaseUser?.uid,
    loading,
    userProfile?.timezone,
    userProfile?.isAutoTimezone,
    stageDeviceTimezone,
  ]);

  useEffect(() => {
    function onStorage(e) {
      if (!e) return;

      if (e.key === TZ_DECLINED_KEY) {
        if (
          pendingDeviceTimezone &&
          isDeclinedLocal(firebaseUser?.uid, pendingDeviceTimezone)
        ) {
          setPendingDeviceTimezone(null);
          setPendingOriginalTimezone(null);
        }
      }

      if (e.key === TZ_ACCEPTED_KEY) {
        try {
          const payload = JSON.parse(e.newValue || "{}");
          if (
            payload &&
            payload.uid &&
            payload.tz &&
            firebaseUser?.uid === payload.uid
          ) {
            if (pendingDeviceTimezone && pendingDeviceTimezone === payload.tz) {
              setPendingDeviceTimezone(null);
              setPendingOriginalTimezone(null);
              lastSyncedTimezoneRef.current = payload.tz;
              console.log(
                "[useTimezoneSync] Detected TZ accepted in another tab:",
                payload.tz
              );
            }
          }
        } catch (err) {
          console.warn(
            "onStorage: failed to parse TZ_ACCEPTED_KEY payload",
            err
          );
        }
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [pendingDeviceTimezone, firebaseUser?.uid]);

  const resetTimezoneState = useCallback(() => {
    timezoneUpdateInProgressRef.current = false;
    lastSyncedTimezoneRef.current = null;
    setPendingDeviceTimezone(null);
    setPendingOriginalTimezone(null);
  }, []);

  const markLogout = useCallback((value) => {
    isLoggingOutRef.current = value;
  }, []);

  useEffect(() => {
    lastSyncedTimezoneRef.current = userProfile?.timezone || null;
  }, [userProfile?.timezone]);

  return {
    detectedTimezone,
    isStable,
    pendingDeviceTimezone,
    pendingOriginalTimezone,
    stageDeviceTimezone,
    declineDeviceTimezone,
    acceptDeviceTimezone,
    resetTimezoneState,
    markLogout,
  };
}

