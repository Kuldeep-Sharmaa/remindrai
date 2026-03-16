/**
 * sendPushNotification.ts
 *
 * Every time a reminder runs — success or failure — this is what
 * actually tells the user about it. Keeps it simple for now,
 * but built in a way that's easy to extend later.
 *
 * Important: this must never crash the reminder execution.
 * Notification is best-effort. If it fails, we log and move on.
 */

import * as admin from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

export type NotificationType = "draft_success" | "draft_failed";

export interface SendPushNotificationInput {
  uid: string;
  type: NotificationType;
  draftId?: string;
  reminderType?: "ai" | "simple";
  platform?: string;
}

// Add new platforms here — notification text picks them up automatically.
// Value comes from Firestore, this map just handles the display formatting.
const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "Twitter",
  instagram: "Instagram",
  threads: "Threads",
  facebook: "Facebook",
};

// Builds the right notification title based on what kind of reminder ran.
// AI reminders with a platform get specific text, everything else gets a clean fallback.
function buildNotificationContent(
  type: NotificationType,
  reminderType?: string,
  platform?: string,
): { title: string; body: string } {
  if (type === "draft_failed") {
    return {
      title: "Draft could not be prepared",
      body: "Check prompt settings.",
    };
  }

  if (reminderType === "ai" && platform) {
    const platformLabel = PLATFORM_LABELS[platform.toLowerCase()] ?? platform;
    return {
      title: `Your ${platformLabel} draft is ready`,
      body: "View draft.",
    };
  }

  return {
    title: "Your draft is ready",
    body: "View draft.",
  };
}

export async function sendPushNotification(
  input: SendPushNotificationInput,
): Promise<void> {
  const { uid, type, draftId, reminderType, platform } = input;

  try {
    const db = admin.firestore();

    // Always check the user's preference first —
    // never send a notification someone opted out of
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      console.warn("[sendPushNotification] User doc not found", { uid });
      return;
    }

    const draftAlerts =
      userDoc.data()?.notificationPreferences?.draftAlerts ?? true;

    if (!draftAlerts) {
      console.log("[sendPushNotification] draftAlerts off for user, skipping", {
        uid,
      });
      return;
    }

    // Pull every device this user has registered
    const devicesSnap = await db
      .collection("users")
      .doc(uid)
      .collection("devices")
      .get();

    if (devicesSnap.empty) {
      console.log("[sendPushNotification] No devices registered yet", { uid });
      return;
    }

    const { title, body } = buildNotificationContent(
      type,
      reminderType,
      platform,
    );
    const messaging = getMessaging();
    const invalidDeviceIds: string[] = [];

    // Fire off to all devices at once — no need to wait on each
    await Promise.all(
      devicesSnap.docs.map(async (deviceDoc) => {
        const { token } = deviceDoc.data() as { token: string };

        if (!token) return;

        try {
          // We send data-only — no notification field.
          // Sending a notification field causes FCM to display it automatically
          // in addition to what our service worker shows — resulting in duplicates.
          // The service worker reads title and body from data and handles display itself.
          const data: Record<string, string> = {
            type,
            title,
            body,
            clickUrl: "/workspace/drafts",
          };

          if (draftId) data.draftId = draftId;

          await messaging.send({
            token,
            data,
            webpush: {
              fcmOptions: {
                link: "/workspace/drafts",
              },
            },
          });

          console.log("[sendPushNotification] Notification sent", {
            uid,
            deviceId: deviceDoc.id,
            type,
            reminderType: reminderType ?? null,
            platform: platform ?? null,
            draftId: draftId ?? null,
          });
        } catch (err: any) {
          const errorCode = err?.errorInfo?.code ?? "";

          // These two codes mean the token is dead — user cleared
          // browser storage, uninstalled the PWA, etc. Queue it for removal
          // so we're not sending to ghost devices forever
          if (
            errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered"
          ) {
            console.warn(
              "[sendPushNotification] Dead token found, queuing for cleanup",
              {
                uid,
                deviceId: deviceDoc.id,
              },
            );
            invalidDeviceIds.push(deviceDoc.id);
          } else {
            console.error("[sendPushNotification] Failed to send to device", {
              uid,
              deviceId: deviceDoc.id,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
      }),
    );

    // Batch delete any dead tokens we found above
    if (invalidDeviceIds.length > 0) {
      const batch = db.batch();

      invalidDeviceIds.forEach((deviceId) => {
        batch.delete(
          db.collection("users").doc(uid).collection("devices").doc(deviceId),
        );
      });

      await batch.commit();

      console.log("[sendPushNotification] Cleaned up dead tokens", {
        uid,
        count: invalidDeviceIds.length,
      });
    }
  } catch (error) {
    // Something unexpected broke. Not great, but not worth
    // taking down the reminder execution over it
    console.error("[sendPushNotification] Unexpected error", {
      uid,
      type,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
