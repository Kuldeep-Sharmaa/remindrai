/* eslint-env serviceworker */

/**
 * firebase-messaging-sw.js
 *
 * Handles push notifications when the app is in the background or closed.
 * Deduplication added to prevent double notifications in PWA lifecycle edge cases.
 */

importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js",
);

// Ensure new SW activates immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Take control of all clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Deduplication memory (prevents double notification issue)
const handledNotifications = new Set();

firebase.initializeApp({
  apiKey: "AIzaSyAAAgDtBEUJuJueFWmM-tX90qAGjv_zhjU",
  authDomain: "remindrai-e03c6.firebaseapp.com",
  projectId: "remindrai-e03c6",
  storageBucket: "remindrai-e03c6.appspot.com",
  messagingSenderId: "1084422571489",
  appId: "1:259354289567:web:ac57247e2af4d04404c9aa",
});

const messaging = firebase.messaging();

// Background push handler
messaging.onBackgroundMessage((payload) => {
  const id =
    payload.data?.draftId ||
    payload.data?.reminderId ||
    payload.data?.title;

  //  Prevent duplicate notifications (PWA SW lifecycle issue)
  if (handledNotifications.has(id)) {
    return;
  }
  handledNotifications.add(id);

  const title = payload.data?.title ?? "RemindrAI";
  const body = payload.data?.body ?? "You have a new notification.";

  self.registration.showNotification(title, {
    body,
    icon: "/brand_icon.png",
    data: {
      url: "/workspace/drafts",
      draftId: payload.data?.draftId ?? null,
    },
  });

  // Cleanup to avoid memory leak
  setTimeout(() => {
    handledNotifications.delete(id);
  }, 10000);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/workspace/drafts";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }

        // If no open window, open new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});