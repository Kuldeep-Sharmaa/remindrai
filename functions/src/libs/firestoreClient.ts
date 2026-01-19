/**
 * firestoreClient.ts
 *
 * Purpose:
 * Minimal, safe Firebase Admin Firestore singleton.
 *
 * IMPORTANT (LOCKED DESIGN):
 * - NO retries
 * - NO transactions
 * - NO batch abstractions
 * - NO hidden logic
 *
 * This file exists ONLY to:
 * - initialize firebase-admin once
 * - expose a shared Firestore instance
 * - expose FieldValue helpers
 */

import * as admin from "firebase-admin";

/**
 * Initialize firebase-admin exactly once
 * Uses default credentials provided by the environment
 */
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Firestore instance getter
 */
export function getDb() {
  return db;
}

/**
 * FieldValue helpers (explicit exports only)
 */
export const serverTimestamp = () =>
  admin.firestore.FieldValue.serverTimestamp();

export const increment = (value: number) =>
  admin.firestore.FieldValue.increment(value);

export const arrayUnion = (...values: unknown[]) =>
  admin.firestore.FieldValue.arrayUnion(...values);

export const arrayRemove = (...values: unknown[]) =>
  admin.firestore.FieldValue.arrayRemove(...values);

/**
 * Export admin Timestamp explicitly if needed
 */
export const Timestamp = admin.firestore.Timestamp;
