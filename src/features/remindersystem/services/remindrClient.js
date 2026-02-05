/**
 * remindrClient.js
 *
 * Firestore client for user reminders.
 * Writes user intent only. Backend owns execution logic.
 *
 * Core rules:
 * - Intent is immutable (no updates)
 * - History is permanent (no deletions)
 * - User can only create or disable
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  limit as queryLimit,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../../services/firebase";

const USER_DOC = "users";
const REMINDERS_COL = "reminders";

// Backend callable for deletion
const functions = getFunctions();
const deleteReminderCallable = httpsCallable(functions, "deleteReminder");

// Get user reminders collection reference
function getUserRemindersCol(uid) {
  if (!uid) throw new Error("uid is required");
  return collection(db, USER_DOC, uid, REMINDERS_COL);
}

// Normalize schedule object from various input formats
function normalizeSchedule(
  payloadSchedule = {},
  timezoneFallback = "UTC",
  frequency = "one_time",
) {
  const timezone =
    payloadSchedule?.timezone ||
    payloadSchedule?.tz ||
    timezoneFallback ||
    "UTC";
  const timeOfDay =
    payloadSchedule?.localTime || payloadSchedule?.timeOfDay || "09:00";

  const out = { timezone, timeOfDay };
  const date = payloadSchedule?.localDate || payloadSchedule?.date;
  if (date) out.date = date;

  const rawWd =
    payloadSchedule?.daysOfWeek || payloadSchedule?.weekDays || null;
  if (frequency === "weekly" && Array.isArray(rawWd) && rawWd.length > 0) {
    out.weekDays = rawWd.slice(0, 7);
  }

  return out;
}

// Validate required fields
function validateMinimalPayload(payload) {
  if (!payload || typeof payload !== "object")
    throw new Error("payload object required");
  if (!payload.ownerId) throw new Error("ownerId is required");
  if (!payload.frequency) throw new Error("frequency is required");
  if (!payload.schedule) throw new Error("schedule is required");
  if (!payload.reminderType) throw new Error("reminderType is required");
}

// Sanitize string content
function safeTrimString(v, maxLen = 2000) {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, maxLen);
  return s === "" ? null : s;
}

// Build intent document for Firestore
function buildIntentDoc(payload, schedule) {
  const baseDoc = {
    ownerId: payload.ownerId,
    reminderType:
      String(payload.reminderType).toLowerCase() === "ai" ? "ai" : "simple",
    frequency: payload.frequency,
    schedule,
  };

  if (baseDoc.reminderType === "ai") {
    const content = {
      aiPrompt: safeTrimString(
        payload.content?.aiPrompt ?? payload.prompt ?? "",
        2000,
      ),
      tone: safeTrimString(payload.content?.tone ?? payload.tone, 100),
      platform: safeTrimString(
        payload.content?.platform ?? payload.platform,
        50,
      ),
      role: safeTrimString(payload.content?.role ?? payload.role, 100),
    };
    return { ...baseDoc, content };
  }

  const content = {
    message: safeTrimString(
      payload.content?.message ?? payload.message ?? "",
      2000,
    ),
    title: safeTrimString(payload.title, 200),
    notes: safeTrimString(payload.notes, 2000),
  };

  return { ...baseDoc, content };
}

/**
 * Create a new reminder.
 * Returns created reminder with ID.
 */
export async function addReminder(payload) {
  validateMinimalPayload(payload);

  const uid = payload.ownerId;
  const colRef = getUserRemindersCol(uid);

  const schedule = normalizeSchedule(
    payload.schedule,
    payload.timezoneAtCreation || "UTC",
    payload.frequency,
  );

  const docData = buildIntentDoc(payload, schedule);

  try {
    const docRef = doc(colRef);
    await setDoc(docRef, docData);
    return { id: docRef.id, ...docData };
  } catch (err) {
    console.error("addReminder failed:", err);
    throw err;
  }
}

/**
 * Updates not supported - intent is immutable.
 */
export async function updateReminder() {
  throw new Error("Reminder updates are not supported. Intent is immutable.");
}

/**
 * Disable reminder via backend callable.
 * Returns deletion status from backend.
 */
export async function disableReminder(uid, reminderId) {
  if (!uid || !reminderId) {
    throw new Error("uid and reminderId are required");
  }

  try {
    const res = await deleteReminderCallable({ reminderId });
    return res.data; // { status: "deleted" | "already_deleted" }
  } catch (err) {
    console.error("disableReminder failed:", err);
    throw err;
  }
}

/**
 * Fetch single reminder by ID.
 */
export async function getReminder(uid, reminderId) {
  const snap = await getDoc(doc(getUserRemindersCol(uid), reminderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * List all reminders for a user.
 */
export async function listUserReminders(uid, { limit = 100 } = {}) {
  const q = query(
    getUserRemindersCol(uid),
    orderBy("createdAt", "desc"),
    queryLimit(limit),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Real-time listener for reminder changes.
 */
export function subscribeToReminders(uid, callback) {
  const q = query(getUserRemindersCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback({
      snapshot,
      changes: snapshot.docChanges(),
      meta: { size: snapshot.size },
    });
  });
}

const defaultExport = {
  addReminder,
  updateReminder,
  disableReminder,
  getReminder,
  listUserReminders,
  subscribeToReminders,
};

export default defaultExport;
