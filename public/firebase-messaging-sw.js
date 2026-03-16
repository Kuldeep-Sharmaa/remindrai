/* eslint-env serviceworker */

/**
 * firebase-messaging-sw.js
 *
 * Handles push notifications when the app is in the background or closed.
 * Place this file in /public — it must be served from the root of the domain.
 *
 * IMPORTANT: Service workers can't access Vite environment variables.
 * You need to hardcode your Firebase config here. These values are public
 * and safe to commit — they're the same ones in your firebaseConfig object.
 *
 * Where to find them:
 * Firebase Console → Project Settings → General → Your apps → SDK setup
 */

importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js",
);

// Take control immediately on install so Chrome doesn't show
// "This site has been updated in the background" on every push.
// Without this, Chrome re-installs the service worker each time a push
// wakes it up and triggers the update notification unnecessarily.
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Claim all open clients immediately after activation so the new
// service worker takes over without waiting for a page reload.
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

firebase.initializeApp({
  apiKey: "AIzaSyAAAgDtBEUJuJueFWmM-tX90qAGjv_zhjU",
  authDomain: "remindrai-e03c6.firebaseapp.com",
  projectId: "remindrai-e03c6",
  storageBucket: "remindrai-e03c6.appspot.com",
  messagingSenderId: "1084422571489",
  appId: "1:259354289567:web:ac57247e2af4d04404c9aa",
});

const messaging = firebase.messaging();

// Fires when a push arrives and the app is in the background or closed.
// When the app is open, onMessage() in the app handles it instead.
// We read from payload.data — not payload.notification — because we send
// data-only payloads to prevent FCM from auto-displaying a duplicate notification.
messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title ?? "RemindrAI";
  const body = payload.data?.body ?? "You have a new notification.";

  self.registration.showNotification(title, {
    body,
    icon: "/brand_icon.png",
    data: {
      // draftId is passed through for future deep linking support
      url: "/workspace/drafts",
      draftId: payload.data?.draftId ?? null,
    },
  });
});

// When the user clicks the notification, open /workspace/drafts.
// If the app is already open in a tab, focus that tab instead of opening a new one.
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

        // App not open anywhere — open a new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
