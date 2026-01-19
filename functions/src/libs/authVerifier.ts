/**
 * authVerifier.js
 * ---------------------------------------------
 * Purpose:
 *   - Helper to verify Firebase ID tokens in server endpoints.
 *
 * Responsibilities / Contents:
 *   - Verify JWT tokens using admin.auth().verifyIdToken
 *   - Return decoded token or throw
 *
 * Invariants & Guarantees:
 *   - This is a helper for endpoints that accept user-supplied tokens.
 *
 * When to update / modify this file:
 *   - When your auth rules or claims change.
 * ---------------------------------------------
 */

import admin from "firebase-admin";

export async function verifyIdToken(idToken: string) {
  if (!idToken) throw new Error("Missing idToken");
  return admin.auth().verifyIdToken(idToken);
}

export default { verifyIdToken };
