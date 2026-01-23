/**
 * index.ts
 *
 * Firebase Functions entrypoint.
 * Initializes Firebase Admin ONCE.
 * Exports function triggers only.
 */

import * as admin from "firebase-admin";
// Initialize Firebase Admin SDK
admin.initializeApp();

// Export triggers
export { runScheduler } from "./scheduler/runScheduler";
