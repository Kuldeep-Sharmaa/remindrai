/**
 * Firestore trigger that initializes reminder system fields.
 * Computes first nextRunAtUTC based on user's schedule.
 *
 * Uses set({ merge: true }) instead of update() to avoid NOT_FOUND errors
 * in emulator when parent user doc doesn't exist yet.
 */

import * as functions from "firebase-functions/v1";
import { FieldValue } from "firebase-admin/firestore";

import { computeInitialNextRunAtUTC } from "../utils/initialSchedule";
import { logger } from "../libs/logger";

export const onReminderCreate = functions.firestore
  .document("users/{uid}/reminders/{reminderId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    // Never re-initialize if already set
    if (data.nextRunAtUTC) {
      return;
    }

    const frequency = data.frequency;
    const schedule = data.schedule;

    if (!frequency || !schedule) {
      logger.warn("Reminder missing intent fields", {
        reminderId: context.params.reminderId,
      });
      return;
    }

    const nextRunAtUTC = computeInitialNextRunAtUTC(frequency, schedule);

    if (!nextRunAtUTC) {
      logger.warn("Invalid reminder schedule", {
        reminderId: context.params.reminderId,
        schedule,
      });
      return;
    }

    // Use merge to avoid NOT_FOUND when parent user doc is missing
    await snap.ref.set(
      {
        nextRunAtUTC,
        enabled: true,
        updatedAt: FieldValue.serverTimestamp(),
        initializedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
