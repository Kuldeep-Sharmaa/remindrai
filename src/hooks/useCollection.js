// src/hooks/useCollection.js
// ============================================================================
// 📁 useCollection.js
// ----------------------------------------------------------------------------
// 🔹 Purpose:
//   Reusable hook for real-time Firestore collection listeners.
//
// 🔹 Responsibilities:
//   - Accepts a Firestore query
//   - Subscribes via `onSnapshot`
//   - Returns { documents, isPending, error }
//   - Cleans up automatically on unmount
//
// 🔹 When to edit:
//   - Change how real-time caching or pagination works
//   - Add sorting or field filtering inside the hook
// ============================================================================
// src/hooks/useCollection.js
// Safe, drop-in replacement for your original hook.
// - Avoids setState-after-unmount
// - Returns [] for empty documents (easier consumer handling)
// - Accepts an optional transform via options but reads it from a ref
//   so it won't retrigger listeners when its identity changes.

import { useState, useEffect, useRef } from "react";
import { onSnapshot } from "firebase/firestore";

/**
 * useCollection(q, options)
 * options:
 *  - includeMetadataChanges: boolean (passed to onSnapshot)
 *  - transform: (doc) => docTransformed  // optional; will be read from ref (no effect dependency)
 *
 * Returns: { documents, isPending, error }
 *
 * NOTE: This is intentionally conservative and drop-in compatible with
 * your previous implementation to avoid changing behavior unexpectedly.
 */
export const useCollection = (q, options = {}) => {
  const { includeMetadataChanges = false, transform = null } = options;

  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(true);

  const mountedRef = useRef(true);
  const unsubscribeRef = useRef(null);
  const transformRef = useRef(transform);

  // keep transformRef up to date but don't include in effect deps
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (e) {
          // noop
        }
        unsubscribeRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Reset state when query changes
    setIsPending(true);
    setError(null);

    // If no query, set empty results and stop (compatible with previous behaviour)
    if (!q) {
      setDocuments([]);
      setIsPending(false);
      return;
    }

    try {
      const unsubscribe = onSnapshot(
        q,
        { includeMetadataChanges },
        (snapshot) => {
          try {
            const results = snapshot.docs.map((doc) => {
              const raw = { ...doc.data(), id: doc.id };
              if (typeof transformRef.current === "function") {
                try {
                  // allow transform to mutate or return new object
                  return transformRef.current(raw) || raw;
                } catch (txErr) {
                  // eslint-disable-next-line no-console
                  console.warn(
                    "useCollection: transform function threw:",
                    txErr
                  );
                  return raw;
                }
              }
              return raw;
            });

            if (mountedRef.current) {
              setDocuments(results);
              setIsPending(false);
              setError(null);
            }
          } catch (processingError) {
            // eslint-disable-next-line no-console
            console.error(
              "useCollection: snapshot processing failed:",
              processingError
            );
            if (mountedRef.current) {
              setError({
                message: "Snapshot processing failed",
                details: processingError.message,
              });
              setIsPending(false);
            }
          }
        },
        (err) => {
          // eslint-disable-next-line no-console
          console.error("useCollection: onSnapshot error:", err);
          if (mountedRef.current) {
            setError({
              message: err.message || "Could not fetch the data",
              code: err.code || null,
            });
            setIsPending(false);
          }
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        "useCollection: failed to attach onSnapshot listener:",
        err
      );
      if (mountedRef.current) {
        setError({
          message: err.message || "Listener attach failed",
          code: err.code || null,
        });
        setIsPending(false);
      }
      return;
    }

    return () => {
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch {
          // ignore
        }
        unsubscribeRef.current = null;
      }
    };
    // Intentionally only depend on 'q' and includeMetadataChanges to avoid reattaching for
    // ephemeral function identities (like inline transforms). The transform is read via ref.
  }, [q, includeMetadataChanges]);

  return { documents, isPending, error };
};
